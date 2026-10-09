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
  await expect(page.getByRole('heading', { name: '익숙한 매듭, 나만의 스타일로.' })).toBeVisible()
  await expect(page.getByRole('link', { name: '나의 한 줄 찾기', exact: true })).toHaveAttribute(
    'href',
    '#/products',
  )
  await expect(page.locator('svg image').first()).toHaveAttribute(
    'href',
    '/mekit/images/concept-3.png',
  )
  await page.getByRole('link', { name: '나의 한 줄 찾기', exact: true }).click()
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
