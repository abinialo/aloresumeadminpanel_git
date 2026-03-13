import React, { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const Login = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!formData.email.trim() || !formData.password.trim()) {
      setError('Email and password are required.')
      return
    }

    setError('')
    navigate('/template')
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-slate-50 px-4'>
      <div className='w-full max-w-md space-y-6 rounded-2xl bg-white p-8 shadow-xl shadow-slate-200'>
        <div>
          <p className='text-sm font-semibold uppercase tracking-[0.3em] text-slate-400'>Alo Resume</p>
          <h1 className='mt-2 text-3xl font-semibold text-slate-900'>Welcome back</h1>
          <p className='text-sm text-slate-500'>Use your email and password to continue.</p>
        </div>

        <form className='space-y-4' onSubmit={handleSubmit}>
          <div>
            <label htmlFor='email' className='text-sm font-medium text-slate-600'>
              Email
            </label>
            <input
              id='email'
              name='email'
              type='email'
              value={formData.email}
              onChange={handleChange}
              placeholder='you@example.com'
              className='mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white'
            />
          </div>

          <div>
            <label htmlFor='password' className='text-sm font-medium text-slate-600'>
              Password
            </label>
            <div className='relative mt-1'>
              <input
                id='password'
                name='password'
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                placeholder='••••••••'
                className='w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white'
              />
              <button
                type='button'
                onClick={() => setShowPassword((prev) => !prev)}
                className='absolute inset-y-0 right-3 flex items-center justify-center text-slate-500 hover:text-slate-700'
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
              </button>
            </div>
          </div>

          {error && <p className='text-xs text-red-600'>{error}</p>}

          <button
            type='submit'
            className='w-full rounded-2xl bg-blue-600  px-4 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-slate-800'
          >
            Sign in
          </button>
        </form>

        <p className='text-center text-xs text-slate-400'>
          By continuing you agree to our terms and privacy policy.
        </p>
      </div>
    </div>
  )
}

export default Login
