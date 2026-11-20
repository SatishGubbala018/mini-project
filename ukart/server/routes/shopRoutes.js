import express from 'express'
import User from '../models/User.js'
import Order from '../models/Order.js'
import { verifyToken } from '../utils/auth.js'

const shopRouter = express.Router()

const requireAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
    if (!token) return res.status(401).json({ message: 'Authentication required.' })

    const decoded = verifyToken(token)
    req.userId = decoded.id
    next()
  } catch (_error) {
    return res.status(401).json({ message: 'Invalid or expired session.' })
  }
}

shopRouter.get('/profile', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password')
    if (!user) return res.status(404).json({ message: 'User not found.' })

    return res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address || {},
    })
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load profile.' })
  }
})

shopRouter.put('/profile', requireAuth, async (req, res) => {
  try {
    const { name, phone, address } = req.body
    const user = await User.findById(req.userId)
    if (!user) return res.status(404).json({ message: 'User not found.' })

    if (typeof name === 'string') user.name = name.trim()
    if (typeof phone === 'string') user.phone = phone.trim()
    if (address && typeof address === 'object') {
      user.address = {
        fullName: String(address.fullName || name || user.name).trim(),
        phone: String(address.phone || phone || user.phone).trim(),
        addressLine: String(address.addressLine || '').trim(),
        city: String(address.city || '').trim(),
        state: String(address.state || '').trim(),
        pincode: String(address.pincode || '').trim(),
      }
    }

    await user.save()
    return res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address || {},
    })
  } catch (error) {
    return res.status(500).json({ message: 'Unable to update profile.' })
  }
})

shopRouter.post('/orders', requireAuth, async (req, res) => {
  try {
    const { items, address, paymentMethod } = req.body

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Your cart is empty.' })
    }

    const requiredAddressFields = ['fullName', 'phone', 'addressLine', 'city', 'state', 'pincode']
    if (!address || requiredAddressFields.some((field) => !String(address[field] || '').trim())) {
      return res.status(400).json({ message: 'Complete delivery address is required.' })
    }

    const safeItems = items.map((item) => ({
      productId: Number(item.id),
      title: String(item.title || ''),
      image: String(item.image || ''),
      price: Number(item.price || 0) * 90,
      quantity: Math.max(1, Number(item.quantity) || 1),
    }))

    const subtotal = safeItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const discount = safeItems.reduce((sum, item, index) => {
      const percentage = Number(items[index]?.discountPercentage || 0)
      return sum + (item.price * percentage / 100) * item.quantity
    }, 0)
    const totalAmount = subtotal - discount

    const order = await Order.create({
      user: req.userId,
      items: safeItems,
      address: {
        fullName: address.fullName.trim(),
        phone: address.phone.trim(),
        addressLine: address.addressLine.trim(),
        city: address.city.trim(),
        state: address.state.trim(),
        pincode: address.pincode.trim(),
      },
      paymentMethod: 'COD',
      paymentStatus: 'Pending',
      subtotal,
      discount,
      totalAmount,
    })

    await User.findByIdAndUpdate(req.userId, { address: order.address })

    return res.status(201).json({ message: 'Order placed successfully.', order })
  } catch (error) {
    console.error('Create order error:', error)
    return res.status(500).json({ message: 'Unable to place order.' })
  }
})

shopRouter.get('/orders', requireAuth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.userId }).sort({ createdAt: -1 })
    return res.json({ orders })
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load orders.' })
  }
})

export default shopRouter
