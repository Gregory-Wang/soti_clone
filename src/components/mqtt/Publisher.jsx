import React, { useContext, useState } from 'react';
import { QosOption } from './index';
import { useLanguage } from '@/hooks/useLanguage.js';

const Publisher = ({ publish }) => {
  const { t } = useLanguage();
  const qosOptions = useContext(QosOption);

  // Print self-test page
  const printSelfTestPage = () => {
    const context = {
      topic: 'soticlone/c58h/server/print',
      qos: 0,
      payload: {
        "taskId": "1234567890",
        "content": "SELFTEST \r\nPRINT 1\r\n"
      }
    }
    publish(context)
  }

  const [form, setForm] = useState({
    topic: 'soticlone/c58h/server/print',
    qos: 0,
    payload: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleQosChange = (e) => {
    setForm(prev => ({
      ...prev,
      qos: Number(e.target.value),
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    publish(form);
  };

  return (
    <div className="bg-white p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">{t('publish')}</h2>
      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              onChange={handleQosChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {qosOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('payload')}</label>
          <textarea
            name="payload"
            value={form.payload}
            onChange={handleChange}
            rows={4}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-blue-600 text-white rounded-lg px-4 py-2 font-semibold hover:bg-blue-700 transition"
          >
            {t('publish')}
          </button>
          
        </div>
      </form>
      <button onClick={printSelfTestPage} className="bg-green-600 text-white rounded-lg px-4 py-2 font-semibold hover:bg-green-700 transition">{t('printSelfTest')}</button>
    </div>
  );
};

export default Publisher;