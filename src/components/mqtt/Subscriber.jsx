import React, { useContext, useState } from 'react'
import { QosOption } from './index'
import { useLanguage } from '@/hooks/useLanguage.js';

const Subscriber = ({ sub, unSub, showUnsub }) => {
  const { t } = useLanguage();
  const qosOptions = useContext(QosOption)
  const [form, setForm] = useState({
    topic: 'soticlone/c58h/printer/heartbeat',
    qos: 0,
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({
      ...prev,
      [name]: name === 'qos' ? Number(value) : value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    sub(form)
  }

  const handleUnsub = () => {
    unSub(form)
  }

  return (
    <div className="bg-white p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">{t('subscribe')}</h2>
      <form className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('topic')}</label>
          <input
            type="text"
            name="topic"
            value={form.topic}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('qos')}</label>
          <select
            name="qos"
            value={form.qos}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {qosOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2 flex justify-end gap-2 mt-2">
          <button
            type="submit"
            className="bg-blue-600 text-white rounded-lg px-4 py-2 font-semibold hover:bg-blue-700 transition"
          >
            {t('subscribe')}
          </button>
          {showUnsub && (
            <button
              type="button"
              className="bg-red-600 text-white rounded-lg px-4 py-2 font-semibold hover:bg-red-700 transition"
              onClick={handleUnsub}
            >
              {t('unsubscribe')}
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

export default Subscriber