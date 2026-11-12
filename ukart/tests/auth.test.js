import test from 'node:test'
import assert from 'node:assert/strict'

import { hashPassword, verifyPassword, generateToken } from '../server/utils/auth.js'

test('hashPassword creates a bcrypt hash', async () => {
  const password = 'Test@123'
  const hash = await hashPassword(password)

  assert.notEqual(hash, password)
  assert.ok(hash.startsWith('$2'))
})

test('verifyPassword validates the original password', async () => {
  const password = 'Test@123'
  const hash = await hashPassword(password)

  assert.equal(await verifyPassword(password, hash), true)
  assert.equal(await verifyPassword('wrong-password', hash), false)
})

test('generateToken returns a JWT string', () => {
  const token = generateToken({ id: 'user-123', email: 'test@example.com' })

  assert.equal(typeof token, 'string')
  assert.ok(token.length > 20)
})
