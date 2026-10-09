import { expect, test } from '@playwright/test'

test('all four collections open with their fixed-price sizing form', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: '익숙한 매듭, 나만의 스타일로.' })).toBeVisible()
  for (const code of ['earth', 'industry', 'amber', 'fragment']) {
    await page.goto(`/products/${code}`)
    await expect(page.getByRole('heading', { name: code.toUpperCase(), exact: true })).toBeVisible()
    await expect(page.getByText('15~21cm, 길이 추가금 없이')).toBeVisible()
    await expect(page.getByRole('button', { name: `${code.toUpperCase()} 주문하기` })).toBeEnabled()
  }
})

test('unsupported wrist recommendation blocks an order without silently changing the length', async ({
  page,
}) => {
  await page.goto('/products/earth')
  await page.getByRole('combobox', { name: /손목 둘레/ }).selectOption('21')
  await page.getByRole('button', { name: '여유 있게', exact: false }).click()
  await expect(page.locator('.recommendation strong')).toHaveText('22.5cm')
  await expect(page.getByRole('button', { name: 'EARTH 주문하기' })).toBeDisabled()
  await page.getByRole('button', { name: '완성 길이로 선택' }).click()
  await page.getByLabel('팔찌 완성 길이').selectOption('21')
  await expect(page.getByRole('button', { name: 'EARTH 주문하기' })).toBeEnabled()
})

test('checkout validates, creates one demo order, and recovers without storing delivery details', async ({
  page,
}) => {
  await page.goto('/products/earth')
  await page.getByRole('button', { name: 'EARTH 주문하기' }).click()
  await expect(page).toHaveURL(/checkout/)
  await page.getByRole('button', { name: '39,000원 데모 주문 만들기' }).click()
  await expect(page.getByText('받는 분 이름을 두 글자 이상 입력해 주세요.')).toBeVisible()
  await page.getByLabel('받는 분').fill('테스트사용자')
  await page.getByLabel('휴대전화').fill('01012345678')
  await page.getByLabel('우편번호').fill('04524')
  await page.getByLabel('기본 주소').fill('비밀주소 서울시 테스트로 10')
  await page.getByRole('checkbox', { name: /이용약관에 동의합니다/ }).check()
  await page.getByRole('checkbox', { name: /배송정보 사용 안내에 동의합니다/ }).check()
  await page.getByRole('checkbox', { name: /제작 사양과 예정일을 확인했습니다/ }).check()
  await page.getByRole('button', { name: '39,000원 데모 주문 만들기' }).click()
  await expect(page.getByRole('heading', { name: '나만의 한 줄, 준비되었어요.' })).toBeVisible()
  const saved = await page.evaluate(() => JSON.stringify(localStorage))
  expect(saved).not.toContain('테스트사용자')
  expect(saved).not.toContain('01012345678')
  expect(saved).not.toContain('비밀주소')
  await page.reload()
  await expect(page.getByText('17.5cm', { exact: false }).first()).toBeVisible()
  await page.getByRole('button', { name: '취소 요청' }).click()
  await expect(page.getByText('취소 요청이 이 기기에 기록되었어요.')).toBeVisible()
  await expect(
    page.getByText('실제 결제나 환불은 발생하지 않습니다.', { exact: false }).first(),
  ).toBeVisible()
})

test('favorites persist, material archive and size guide are navigable', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'EARTH 찜하기' }).click()
  await page.goto('/favorites')
  await expect(page.getByRole('link', { name: 'EARTH 자세히 보기' })).toBeVisible()
  await page.reload()
  await expect(page.getByRole('link', { name: 'EARTH 자세히 보기' })).toBeVisible()
  await page.goto('/materials')
  await expect(page.getByRole('heading', { name: '일곱 가지 물성, 무한한 표정.' })).toBeVisible()
  await page.goto('/size-guide')
  await page.getByLabel('내 손목 둘레').selectOption('16')
  await expect(page.locator('.recommendation strong')).toHaveText('17.0cm')
})

test('support records only a local demo inquiry and navigation handles unknown paths', async ({
  page,
}) => {
  await page.goto('/support')
  await page.getByLabel('문의 내용').fill('길이 선택 방법을 알고 싶어요.')
  await page.getByRole('button', { name: '데모 문의 작성 완료' }).click()
  await expect(page.getByText('문의 내용을 확인했어요.')).toBeVisible()
  await expect(page.getByText('데모 화면이므로 고객센터에 전송되지 않았습니다.')).toBeVisible()
  await page.goto('/unknown-route')
  await expect(
    page.getByRole('heading', { name: '이 페이지는 아직 엮이지 않았어요.' }),
  ).toBeVisible()
})

test('main screens fit the viewport and render without browser errors', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  for (const route of [
    '/',
    '/products/earth',
    '/size-guide',
    '/materials',
    '/orders',
    '/support',
  ]) {
    await page.goto(route)
    await expect(page.locator('main')).toBeVisible()
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1,
    )
    expect(overflow, `horizontal overflow on ${route}`).toBe(false)
  }
  expect(errors).toEqual([])
})
