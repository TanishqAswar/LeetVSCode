// src/components/modals/UpgradeModal.tsx

import React, { useState, useEffect } from 'react'
import colors from 'colors'

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  onUpgrade: () => void
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  onUpgrade,
}) => {
  const [showPayment, setShowPayment] = useState(false)
  const [licenseKey, setLicenseKey] = useState('')
  const [isActivating, setIsActivating] = useState(false)
  const [email, setEmail] = useState('')
  const [paymentStep, setPaymentStep] = useState<
    'email' | 'qr' | 'standard' | 'processing' | 'success'
  >('email')
  const [qrCodeData, setQrCodeData] = useState<any>(null)
  const [orderData, setOrderData] = useState<any>(null)
  const [paymentId, setPaymentId] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [paymentLinkUrl, setPaymentLinkUrl] = useState('')

  // 🚨 NEW: Real-time payment tracking
  const [sessionId, setSessionId] = useState('')
  const [eventSourceRef, setEventSourceRef] =   useState<EventSource | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<
    'disconnected' | 'connecting' | 'connected'
  >('disconnected')

  const BACKEND_URL =
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:3020'
      : 'http://localhost:3020' // Update this for production


  // Generate session ID when modal opens
  useEffect(() => {
    if (isOpen) {
      const newSessionId = `session_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`
      setSessionId(newSessionId)
      console.log('🆔 Generated session ID:', newSessionId)
    } else {
      // Cleanup when modal closes
      if (eventSourceRef) {
        console.log('🔌 Closing SSE connection on modal close'.bgRed)
        eventSourceRef.close()
        setEventSourceRef(null)
      }
      setConnectionStatus('disconnected')
    }
  }, [isOpen])

  // Cleanup event source on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef) {
        console.log('🔌 Cleaning up SSE connection on unmount'.bgYellow)
        eventSourceRef.close()
      }
    }
  }, [eventSourceRef])

  if (!isOpen) return null

  // 🚨 NEW: Real-time payment listener using Server-Sent Events
  const startRealTimePaymentListener = (sessionId: string) => {
    if (eventSourceRef) {
      eventSourceRef.close()
    }

    console.log('📡 Starting SSE connection for session:', sessionId)
    setConnectionStatus('connecting')

    const eventSource = new EventSource(
      `${BACKEND_URL}/payment-status/${sessionId}`
    )

    eventSource.onopen = () => {
      console.log('📡 SSE connection opened')
      setConnectionStatus('connected')
    }

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        console.log('📡 SSE message received:', data)

        if (data.type === 'connected') {
          setConnectionStatus('connected')
          setError(null)
        } else if (data.type === 'payment_success') {
          console.log('🎉 Payment success received via SSE!')

          // Payment successful! Auto-activate license
          setLicenseKey(data.license_key)
          setPaymentStep('processing')

          // Show processing for a moment, then activate
          setTimeout(async () => {
            await activateLicenseKey(data.license_key)
          }, 2000)

          // Close the event source
          eventSource.close()
          setEventSourceRef(null)
          setConnectionStatus('disconnected')
        } else if (data.type === 'heartbeat') {
          // Keep-alive heartbeat
          console.log('💓 SSE heartbeat received')
        }
      } catch (error) {
        console.error('❌ Error parsing SSE data:', error)
      }
    }

    eventSource.onerror = (error) => {
      console.error('❌ SSE connection error:', error)
      setConnectionStatus('disconnected')

      // Don't auto-reconnect, let user retry manually
      eventSource.close()
      setEventSourceRef(null)
    }

    setEventSourceRef(eventSource)
    return eventSource
  }

  // Method 1: Try QR Code first (UPDATED with real-time)
  const createQRPayment = async () => {
    if (!email) {
      setError('Please enter your email address')
      return
    }

    setError(null)
    setPaymentStep('qr')

    try {
      const response = await fetch(`${BACKEND_URL}/create-qr`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          session_id: sessionId, // 🚨 Include session ID
        }),
      })

      const data = await response.json()

      if (response.ok) {
        if (data.fallback_to_standard) {
          // QR not available, fallback to standard payment
          setOrderData(data)
          setPaymentStep('standard')
        } else if (data.qr_id) {
          // QR code created successfully
          setQrCodeData({
            id: data.qr_id,
            image_url: data.qr_url,
            order_id: data.order_id,
          })
          setPaymentId(data.qr_id)

          // 🚨 NEW: Start real-time listener instead of polling
          startRealTimePaymentListener(sessionId)
        }
      } else {
        setError(data.error || 'Failed to create payment. Please try again.')
        setPaymentStep('email')
      }
    } catch (error) {
      console.error('QR Payment creation failed:', error)
      // Fallback to payment link
      await createPaymentLink()
    }
  }

  // Method 2: Create Payment Link (UPDATED with real-time)
  const createPaymentLink = async () => {
    if (!email) {
      setError('Please enter your email address')
      return
    }

    setError(null)

    try {
      const response = await fetch(`${BACKEND_URL}/create-payment-link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          session_id: sessionId, // 🚨 Include session ID
        }),
      })

      const data = await response.json()

      if (response.ok && data.payment_url) {
        setPaymentLinkUrl(data.payment_url)
        setPaymentId(data.payment_link_id)

        // Open payment link in new tab
        window.open(data.payment_url, '_blank')

        // Show processing state
        setPaymentStep('processing')

        // 🚨 NEW: Start real-time listener instead of polling
        startRealTimePaymentListener(sessionId)
      } else {
        setError(
          data.error || 'Failed to create payment link. Please try again.'
        )
        setPaymentStep('email')
      }
    } catch (error) {
      console.error('Payment link creation failed:', error)
      setError(
        'Failed to create payment. Please check your internet connection.'
      )
      setPaymentStep('email')
    }
  }

  // Method 3: Standard Razorpay Integration (UPDATED with real-time)
  const createStandardPayment = async () => {
    if (!email) {
      setError('Please enter your email address')
      return
    }

    setError(null)

    try {
      const response = await fetch(`${BACKEND_URL}/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          session_id: sessionId, // 🚨 Include session ID
        }),
      })

      const data = await response.json()

      if (response.ok && data.order_id) {
        setOrderData(data)
        setPaymentStep('standard')

        // 🚨 NEW: Start real-time listener before opening Razorpay
        startRealTimePaymentListener(sessionId)

        // Initialize Razorpay checkout
        initializeRazorpay(data)
      } else {
        setError(data.error || 'Failed to create order. Please try again.')
        setPaymentStep('email')
      }
    } catch (error) {
      console.error('Standard payment creation failed:', error)
      setError(
        'Failed to create payment. Please check your internet connection.'
      )
      setPaymentStep('email')
    }
  }

  // Initialize Razorpay Checkout (UPDATED)
  const initializeRazorpay = (orderData: any) => {
    const options = {
      key: orderData.key,
      amount: orderData.amount * 100, // Convert to paise
      currency: orderData.currency || 'INR',
      name: 'LeetVSCode Premium',
      description: 'Premium Subscription',
      order_id: orderData.order_id,
      handler: function (response: any) {
        // Payment completed, verification will be handled by webhook + SSE
        setPaymentStep('processing')
        console.log(
          '💳 Razorpay payment completed, waiting for verification...'
        )
      },
      prefill: {
        email: email,
      },
      theme: {
        color: '#f97316',
      },
      modal: {
        ondismiss: function () {
          // If user closes modal, go back to email step
          setPaymentStep('email')
          if (eventSourceRef) {
            eventSourceRef.close()
            setEventSourceRef(null)
          }
        },
      },
    }

    // @ts-ignore
    const rzp = new window.Razorpay(options)
    rzp.open()
  }

  // Activate license key (UNCHANGED)
  const activateLicenseKey = async (key: string) => {
    setIsActivating(true)
    setError(null)

    // Validate license key format
    if (!key.startsWith('LEETVS-PREM-') || key.length < 15) {
      setError('Invalid license key format')
      setIsActivating(false)
      return
    }

    try {
      // Store premium status
      await chrome.storage.sync.set({
        isPremium: true,
        licenseKey: key,
        activatedAt: Date.now(),
      })

      setPaymentStep('success')
      setTimeout(() => {
        onUpgrade()
        onClose()
      }, 2000)
    } catch (error) {
      console.error('Failed to activate license:', error)
      setError('Failed to activate. Please try again.')
    }

    setIsActivating(false)
  }

  const activateLicense = async () => {
    await activateLicenseKey(licenseKey)
  }

  const generateTestLicense = () => {
    const testKey = `LEETVS-PREM-TEST-${Math.random()
      .toString(36)
      .substr(2, 6)
      .toUpperCase()}`
    setLicenseKey(testKey)
  }

  // 🚨 REMOVED: Manual payment check (replaced by real-time)
  // 🚨 REMOVED: All polling functions

  // Resend license email (UNCHANGED)
  const resendLicense = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/resend-license`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        setError(null)
        alert('License email resent successfully! Please check your inbox.')
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to resend license email.')
      }
    } catch (error) {
      console.error('Resend license failed:', error)
      setError('Failed to resend license. Please try again.')
    }
  }

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg p-6 max-w-md mx-4 max-h-[90vh] overflow-y-auto'>
        {/* Error Display */}
        {error && (
          <div className='bg-red-50 border border-red-200 rounded-lg p-3 mb-4'>
            <p className='text-red-700 text-sm'>{error}</p>
            {email && (
              <button
                onClick={resendLicense}
                className='text-xs text-blue-600 underline mt-2'
              >
                Resend License Email
              </button>
            )}
          </div>
        )}

        {/* 🚨 NEW: Connection Status Indicator */}
        {connectionStatus !== 'disconnected' && (
          <div className='bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4'>
            <div className='flex items-center gap-2'>
              {connectionStatus === 'connecting' && (
                <>
                  <div className='w-3 h-3 bg-blue-400 rounded-full animate-pulse'></div>
                  <span className='text-xs text-blue-700'>
                    Connecting to payment system...
                  </span>
                </>
              )}
              {connectionStatus === 'connected' && (
                <>
                  <div className='w-3 h-3 bg-green-400 rounded-full'></div>
                  <span className='text-xs text-green-700'>
                    ✅ Connected - Waiting for payment...
                  </span>
                </>
              )}
            </div>
          </div>
        )}

        {!showPayment ? (
          // Initial upgrade screen
          <>
            <h3 className='text-lg font-semibold mb-4 text-center'>
              🚀 Upgrade to Premium
            </h3>
            <div className='text-center mb-4'>
              <div className='text-3xl mb-2'>🧘‍♂️</div>
              <p className='text-gray-600 text-sm mb-4'>
                You've reached your daily limit of 10 AI prompts. Upgrade to
                Premium for unlimited AI guidance!
              </p>
              <div className='bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4'>
                <h4 className='font-medium text-orange-800 mb-2'>
                  Premium Benefits:
                </h4>
                <ul className='text-xs text-orange-700 text-left space-y-1'>
                  <li>✅ Unlimited AI prompts</li>
                  <li>✅ Priority support</li>
                  <li>✅ Advanced features</li>
                  <li>✅ No daily limits</li>
                </ul>
              </div>
              <div className='text-lg font-bold text-orange-600 mb-4'>
                Only ₹2.99/month
              </div>
            </div>
            <div className='flex gap-2 justify-center mb-4'>
              <button
                onClick={onClose}
                className='px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm'
              >
                Maybe Later
              </button>
              <button
                onClick={() => setShowPayment(true)}
                className='px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-sm'
              >
                Continue
              </button>
            </div>
            <div className='text-center'>
              <button
                onClick={() => setShowPayment(true)}
                className='text-xs text-blue-600 underline'
              >
                Already have a license key?
              </button>
            </div>
          </>
        ) : (
          // Payment/License screen
          <>
            {paymentStep === 'email' && (
              <>
                <h3 className='text-lg font-semibold mb-4 text-center'>
                  💳 Secure Payment via Razorpay
                </h3>

                {/* Email Input */}
                <div className='mb-6'>
                  <label className='block text-sm font-medium mb-2'>
                    📧 Email Address (for license delivery)
                  </label>
                  <input
                    type='email'
                    value={email}
                    onChange={(e) => {
                      const val = e.target.value
                      setEmail(val)
                      setError(null)

                      // Live email validation
                      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                      if (val && !emailPattern.test(val)) {
                        setError('Please enter a valid email address')
                      }
                    }}
                    placeholder='your@email.com'
                    className={`w-full p-3 border rounded-lg text-sm focus:ring-2 ${
                      error
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:ring-orange-500 focus:border-orange-500'
                    }`}
                  />
                  {error && (
                    <p className='text-red-500 text-xs mt-1'>{error}</p>
                  )}
                </div>

                {/* Payment Options */}
                <div className='mb-6 space-y-3'>
                  {/* QR Code Payment */}
                  <button
                    onClick={createQRPayment}
                    disabled={!email}
                    className='w-full p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200'
                  >
                    <div className='flex items-center justify-center gap-3'>
                      <div className='text-2xl'>📱</div>
                      <div className='text-left'>
                        <p className='font-medium'>Pay ₹2.99 with QR Code</p>
                        <p className='text-xs opacity-90'>
                          UPI • PhonePe • GPay • Paytm
                        </p>
                      </div>
                    </div>
                  </button>

                  {/* Payment Link */}
                  <button
                    onClick={createPaymentLink}
                    disabled={!email}
                    className='w-full p-4 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:from-green-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200'
                  >
                    <div className='flex items-center justify-center gap-3'>
                      <div className='text-2xl'>🔗</div>
                      <div className='text-left'>
                        <p className='font-medium'>Pay with Payment Link</p>
                        <p className='text-xs opacity-90'>
                          Cards • UPI • Net Banking
                        </p>
                      </div>
                    </div>
                  </button>

                  {/* Standard Payment */}
                  <button
                    onClick={createStandardPayment}
                    disabled={!email}
                    className='w-full p-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200'
                  >
                    <div className='flex items-center justify-center gap-3'>
                      <div className='text-xl'>💳</div>
                      <div className='text-left'>
                        <p className='font-medium text-sm'>Standard Checkout</p>
                        <p className='text-xs opacity-90'>
                          All payment methods
                        </p>
                      </div>
                    </div>
                  </button>
                </div>

                <div className='text-center text-gray-500 text-sm mb-4'>
                  - OR -
                </div>

                {/* License Key Input */}
                <div className='mb-4'>
                  <label className='block text-sm font-medium mb-2'>
                    🔑 Enter License Key
                  </label>
                  <input
                    type='text'
                    value={licenseKey}
                    onChange={(e) => {
                      setLicenseKey(e.target.value.toUpperCase())
                      setError(null)
                    }}
                    placeholder='LEETVS-PREM-XXXXXX'
                    className='w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500'
                  />
                  <div className='flex gap-2 mt-3'>
                    <button
                      onClick={activateLicense}
                      disabled={!licenseKey || isActivating}
                      className='flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 text-sm font-medium'
                    >
                      {isActivating ? 'Activating...' : 'Activate License'}
                    </button>
                    {/* Test button for development */}
                    {process.env.NODE_ENV === 'development' && (
                      <button
                        onClick={generateTestLicense}
                        className='px-3 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 text-xs'
                      >
                        Test Key
                      </button>
                    )}
                  </div>
                </div>

                <div className='flex gap-2 justify-center'>
                  <button
                    onClick={() => setShowPayment(false)}
                    className='px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm'
                  >
                    Back
                  </button>
                </div>
              </>
            )}

            {paymentStep === 'qr' && qrCodeData && (
              <>
                <h3 className='text-lg font-semibold mb-4 text-center'>
                  📱 Scan QR Code to Pay
                </h3>

                <div className='text-center mb-6'>
                  {/* QR Code Display - CROPPED VERSION */}
                  <div className='bg-white border-4 border-blue-200 rounded-lg p-4 mb-4 inline-block'>
                    <div className='w-48 h-48 mx-auto overflow-hidden rounded-lg relative bg-white'>
                      <img
                        src={qrCodeData.image_url}
                        alt='Razorpay QR Code'
                        className='absolute'
                        style={{
                          clipPath: 'inset(40% 20% 37% 20%)',
                          transform: 'scale(1.7)', // Zoom level (1 = no zoom)
                          transformOrigin: 'center', // Zoom from center
                          top: -150,
                        }}
                        onError={(e) => {
                          console.error('QR Code failed to load')
                          setError(
                            'Failed to load QR code. Please try payment link instead.'
                          )
                        }}
                      />

                      {/* Fallback loading state - only shows when image fails */}
                      <div className='absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg -z-10'>
                        <div className='w-32 h-32 border-4 border-gray-300 border-dashed rounded-lg flex items-center justify-center'>
                          <span className='text-gray-500 text-sm'>
                            Loading QR...
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Instructions */}
                  <div className='space-y-3'>
                    <p className='text-sm text-gray-700 font-medium'>
                      Scan with any UPI app to pay ₹2.99
                    </p>
                    <div className='flex justify-center gap-3 text-xs text-gray-600'>
                      <span className='flex items-center gap-1'>
                        📱 <span>PhonePe</span>
                      </span>
                      <span className='flex items-center gap-1'>
                        📱 <span>GPay</span>
                      </span>
                      <span className='flex items-center gap-1'>
                        📱 <span>Paytm</span>
                      </span>
                      <span className='flex items-center gap-1'>
                        📱 <span>BHIM</span>
                      </span>
                    </div>

                    {/* Payment Details */}
                    <div className='bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4'>
                      <p className='text-xs text-blue-700 mb-2 font-medium'>
                        Payment Details:
                      </p>
                      <div className='space-y-1 text-xs'>
                        <div className='flex justify-between'>
                          <span>Amount:</span>
                          <span className='font-mono font-medium'>₹2.99</span>
                        </div>
                        <div className='flex justify-between'>
                          <span>Email:</span>
                          <span className='font-mono'>{email}</span>
                        </div>
                        <div className='flex justify-between'>
                          <span>QR ID:</span>
                          <span className='font-mono text-xs'>
                            {qrCodeData.id?.slice(-8)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 🚨 NEW: Real-time Status Indicator */}
                    <div className='bg-green-50 border border-green-200 rounded-lg p-3 mt-4'>
                      <div className='flex items-center justify-center gap-2'>
                        <div className='w-3 h-3 bg-green-400 rounded-full animate-pulse'></div>
                        <span className='text-xs text-green-700'>
                          ⚡ Real-time payment detection active
                        </span>
                      </div>
                      <p className='text-xs text-gray-600 mt-1 text-center'>
                        Payment will be detected automatically after you pay
                      </p>
                    </div>
                  </div>
                </div>

                <div className='flex gap-2 justify-center mt-4'>
                  <button
                    onClick={() => {
                      setPaymentStep('email')
                      setQrCodeData(null)
                      setError(null)
                      if (eventSourceRef) {
                        eventSourceRef.close()
                        setEventSourceRef(null)
                      }
                    }}
                    className='px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm'
                  >
                    Back
                  </button>
                </div>
              </>
            )}

            {paymentStep === 'standard' && orderData && (
              <>
                <h3 className='text-lg font-semibold mb-4 text-center'>
                  💳 Standard Payment
                </h3>
                <div className='text-center mb-6'>
                  <div className='bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4'>
                    <p className='text-sm text-blue-700 mb-2'>
                      Payment window should have opened automatically.
                    </p>
                    <p className='text-xs text-gray-600'>
                      If not, click the button below to retry.
                    </p>
                  </div>

                  <button
                    onClick={() => initializeRazorpay(orderData)}
                    className='px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-sm font-medium'
                  >
                    Open Payment Window
                  </button>

                  {/* 🚨 NEW: Real-time Status */}
                  {connectionStatus === 'connected' && (
                    <div className='bg-green-50 border border-green-200 rounded-lg p-3 mt-4'>
                      <div className='flex items-center justify-center gap-2'>
                        <div className='w-3 h-3 bg-green-400 rounded-full animate-pulse'></div>
                        <span className='text-xs text-green-700'>
                          ⚡ Monitoring payment in real-time
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className='flex gap-2 justify-center'>
                  <button
                    onClick={() => {
                      setPaymentStep('email')
                      setOrderData(null)
                      setError(null)
                      if (eventSourceRef) {
                        eventSourceRef.close()
                        setEventSourceRef(null)
                      }
                    }}
                    className='px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm'
                  >
                    Back
                  </button>
                </div>
              </>
            )}

            {paymentStep === 'processing' && (
              <>
                <h3 className='text-lg font-semibold mb-4 text-center'>
                  Processing Payment... 🔄
                </h3>
                <div className='text-center mb-6'>
                  <div className='animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent mx-auto mb-4'></div>
                  <p className='text-green-600 text-sm mb-2'>
                    Payment received successfully! ✅
                  </p>
                  <p className='text-gray-600 text-xs'>
                    Generating your license key...
                  </p>
                  <div className='bg-green-50 border border-green-200 rounded-lg p-3 mt-4'>
                    <p className='text-xs text-green-700'>
                      📧 License will be sent to: <strong>{email}</strong>
                    </p>
                  </div>
                  {paymentLinkUrl && (
                    <div className='bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2'>
                      <p className='text-xs text-blue-700'>
                        💡 You can close the payment window if it's still open
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}

            {paymentStep === 'success' && (
              <>
                <h3 className='text-lg font-semibold mb-4 text-center'>
                  🎉 Premium Activated!
                </h3>
                <div className='text-center mb-6'>
                  <div className='text-4xl mb-4'>✅</div>
                  <p className='text-green-600 text-sm mb-2'>
                    Welcome to LeetVSCode Premium!
                  </p>
                  <p className='text-gray-600 text-xs mb-4'>
                    You now have unlimited AI prompts.
                  </p>
                  <div className='bg-green-50 border border-green-200 rounded-lg p-3'>
                    <p className='text-xs text-green-700'>
                      ✨ All premium features unlocked! ✨
                    </p>
                  </div>
                </div>
                <div className='flex gap-2 justify-center'>
                  <button
                    onClick={() => {
                      onUpgrade()
                      onClose()
                    }}
                    className='px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-sm font-medium'
                  >
                    Start Using Premium
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default UpgradeModal
