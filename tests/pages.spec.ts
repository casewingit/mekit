import { expect, test } from '@playwright/test'

test('Pages subdirectory serves images and supports product links and direct reloads', async ({
  page,
}) => {
  const failures: string[] = []
  page.on('pageerror', (error) => failures.push(error.message))
  page.on('response', (response) => {
    if (response.status() >= 400) failures.push(`${response.status()} ${response.url()}`)
  })
  await page.goto('/mekit/')
  await expect(page.getByRole('heading', { name: 'A quiet thread of Korea.' })).toBeVisible()
  await expect(page.getByRole('link', { name: '이전 커머스 데모 ↗', exact: true })).toHaveAttribute(
    'href',
    '#/products',
  )
  await expect(page.locator('svg image').first()).toHaveAttribute(
    'href',
    '/mekit/studio/images/02-indigo-line.png',
  )
  await page.getByRole('link', { name: '이전 커머스 데모 ↗', exact: true }).click()
  await expect(page).toHaveURL(/\/mekit\/#\/products$/)
  await page.getByRole('link', { name: 'EARTH 자세히 보기' }).click()
  await expect(page).toHaveURL(/\/mekit\/#\/products\/earth$/)
  const response = await page.reload()
  expect(response?.status()).toBe(200)
  await expect(page.getByRole('heading', { name: 'EARTH', exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'EARTH 주문하기' }).click()
  await expect(page).toHaveURL(/\/mekit\/#\/checkout\?product=earth&length=17.5/)
  await expect(page.getByRole('heading', { name: '나만의 한 줄을 완성해요.' })).toBeVisible()
  expect(failures).toEqual([])
})

test('Pages preserves section anchors and direct checkout query parameters', async ({ page }) => {
  await page.goto('/mekit/#/materials#wood')
  await expect(page.getByRole('heading', { name: '우드', exact: true })).toBeVisible()
  await page.goto('/mekit/#/checkout?product=amber&length=18')
  await expect(page.getByRole('button', { name: '45,000원 데모 주문 만들기' })).toBeVisible()
  await expect(page.getByText('18.0cm / 수량 1')).toBeVisible()
})

test('Indigo landing connects four image scenes to Studio and preserves board deep links', async ({
  page,
}) => {
  await page.goto('/mekit/')
  await expect(page.locator('[data-scene]')).toHaveCount(4)
  await expect(page.getByText('아직 주문을 받지 않습니다.', { exact: false })).toBeVisible()
  await page.getByRole('link', { name: 'INDIGO LINE 살펴보기' }).click()
  await expect(page).toHaveURL(/indigo-story$/)
  await expect(page.locator('#indigo-story')).toBeInViewport()
  await page.getByRole('link', { name: '무드보드 Studio 열기' }).click()
  await expect(page).toHaveURL(/studio\/#indigo-line$/)
  await expect(page.locator('#board-title')).toHaveText('INDIGO LINE')
  await page.getByRole('button', { name: '다음 무드보드', exact: true }).click()
  await expect(page.locator('#board-title')).toHaveText('FIELD LINE')
  await page.reload()
  await expect(page.locator('#board-title')).toHaveText('FIELD LINE')
  await page.goto('/mekit/studio/')
  await expect(page.locator('#board-title')).toHaveText('INDIGO LINE')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})

test('Field is a second line with working section and board links', async ({ page }) => {
  const failures: string[] = []
  page.on('pageerror', (error) => failures.push(error.message))
  page.on('response', (response) => {
    if (response.status() >= 400) failures.push(response.url())
  })
  await page.goto('/mekit/')
  await page.getByRole('link', { name: '02 / FIELD LINE 나무와 돌의 묵직함' }).click()
  await expect(page.locator('#field-line')).toBeInViewport()
  await expect(page.locator('[data-field-scene]')).toHaveCount(4)
  await expect(
    page.getByRole('heading', { name: 'A rougher edge. The same restraint.' }),
  ).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.getByRole('link', { name: 'FIELD LINE 무드보드', exact: true }).click()
  await expect(page).toHaveURL(/studio\/#field-line$/)
  await expect(page.locator('#board-title')).toHaveText('FIELD LINE')
  await expect(page.locator('#board-image')).toHaveJSProperty('complete', true)
  expect(
    await page.locator('#board-image').evaluate((img: HTMLImageElement) => img.naturalWidth),
  ).toBeGreaterThan(0)
  await page.reload()
  await expect(page.locator('#board-title')).toHaveText('FIELD LINE')
  await page.getByRole('button', { name: '이전 무드보드', exact: true }).click()
  await expect(page.locator('#board-title')).toHaveText('INDIGO LINE')
  expect(failures).toEqual([])
})
