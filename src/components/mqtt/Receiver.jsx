import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage.js';

const Receiver = ({ payload }) => {
  const { t } = useLanguage();
  const [messages, setMessages] = useState([])

  useEffect(() => {
    if (payload.topic) {
      setMessages(messages => [...messages, payload])
    }
  }, [payload])

  return (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-200 max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-4">{t('receiver')}</h2>
      <ul className="divide-y divide-gray-200 border rounded-lg">
        {messages.length === 0 ? (
          <li className="py-4 text-gray-400 text-center">{t('noMessages')}</li>
        ) : (
          messages.map((item, idx) => (
            <li key={idx} className="py-4 px-2">
              <div className="font-semibold text-blue-700">{item.topic}</div>
              <div className="text-gray-700 break-all">{item.message}</div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export default Receiver;