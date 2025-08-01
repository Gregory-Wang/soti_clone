import React, { useState } from 'react'
import { useLanguage } from '@/hooks/useLanguage.js';

const initialConnectionOptions = {
  protocol: 'ws',
  host: 'broker.emqx.io',
  clientId: 'emqx_react_' + Math.random().toString(16).substring(2, 8),
  port: 8083,
  username: 'emqx_test',
  password: 'emqx_test',
}

const Connection = ({ connect, disconnect, connectStatus }) => {
  const { t } = useLanguage();
  const [form, setForm] = useState(initialConnectionOptions)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({
      ...prev,
      [name]: value,
      port: name === 'protocol' ? (value === 'wss' ? 8084 : 8083) : prev.port,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const { protocol, host, clientId, port, username, password } = form
    const url = `${protocol}://${host}:${port}/mqtt`
    const options = {
      clientId,
      username,
      password,
      clean: true,
      reconnectPeriod: 1000,
      connectTimeout: 30 * 1000,
    }
    // First check if already connected
    if (connectStatus === 'Connected') {
      disconnect()
    } else {
      connect(url, options)
    }
  }

  return (
    <div className="bg-white p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">{t('connection')}</h2>
      <form className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('protocol')}</label>
          <select
            name="protocol"
            value={form.protocol}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ws">ws</option>
            <option value="wss">wss</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('host')}</label>
          <input
            type="text"
            name="host"
            value={form.host}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('port')}</label>
          <input
            type="number"
            name="port"
            value={form.port}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('clientId')}</label>
          <input
            type="text"
            name="clientId"
            value={form.clientId}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('username')}</label>
          <input
            type="text"
            name="username"
            value={form.username}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('password')}</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </form>
      <div className="flex gap-4 justify-end">
        {connectStatus === 'Connected' ? (
          <button
            type="button"
            className="bg-red-600 text-white rounded-lg px-4 py-2 font-semibold hover:bg-red-700 transition"
            onClick={disconnect}
          >
            {t('disconnect')}
          </button>
        ):(
          <button
            type="button"
            className="bg-blue-600 text-white rounded-lg px-4 py-2 font-semibold hover:bg-blue-700 transition"
            onClick={handleSubmit}
          >
            {t('connect')}
          </button>
        )}
        
        
      </div>
    </div>
  )
}

export default Connection