import React, { createContext, useEffect, useState } from 'react'
import Connection from './Connection'
import Publisher from './Publisher'
import Subscriber from './Subscriber'
import Receiver from './Receiver'
import mqtt from 'mqtt'
import { useLanguage } from '@/hooks/useLanguage.js';

export const QosOption = createContext([])
// https://github.com/mqttjs/MQTT.js#qos
const qosOption = [
  {
    label: '0',
    value: 0,
  },
  {
    label: '1',
    value: 1,
  },
  {
    label: '2',
    value: 2,
  },
]

const HookMqtt = ({log}) => {
  const { t } = useLanguage();
  const [client, setClient] = useState(null)
  const [isSubed, setIsSub] = useState(false)
  const [payload, setPayload] = useState({})
  const [connectStatus, setConnectStatus] = useState('Connect')

  const mqttConnect = (host, mqttOption) => {
    setConnectStatus(t('connecting'))
    /**
     * if protocol is "ws", connectUrl = "ws://broker.emqx.io:8083/mqtt"
     * if protocol is "wss", connectUrl = "wss://broker.emqx.io:8084/mqtt"
     *
     * /mqtt: MQTT-WebSocket uniformly uses /path as the connection path,
     * which should be specified when connecting, and the path used on EMQX is /mqtt.
     *
     * for more details about "mqtt.connect" method & options,
     * please refer to https://github.com/mqttjs/MQTT.js#mqttconnecturl-options
     */
    setClient(mqtt.connect(host, mqttOption))
  }

  useEffect(() => {
    if (client) {
      // https://github.com/mqttjs/MQTT.js#event-connect
      client.on('connect', () => {
        setConnectStatus(t('connected'))
        log(t('connectionSuccessful'))
      })

      // https://github.com/mqttjs/MQTT.js#event-error
      client.on('error', (err) => {
        console.error('Connection error: ', err)
        log(t('connectionError'))
        client.end()
      })

      // https://github.com/mqttjs/MQTT.js#event-reconnect
      client.on('reconnect', () => {
        setConnectStatus(t('reconnecting'))
      })

      // https://github.com/mqttjs/MQTT.js#event-message
      client.on('message', (topic, message) => {
        const payload = { topic, message: message.toString() }
        setPayload(payload)
        log(`${t('receivedMessage')}: ${message} ${t('fromTopic')}: ${topic}`)
      })
    }
  }, [client])

  // disconnect
  // https://github.com/mqttjs/MQTT.js#mqttclientendforce-options-callback
  const mqttDisconnect = () => {
    if (client) {
      try {
        client.end(false, () => {
          setConnectStatus(t('connect'))
          log(t('disconnectedSuccessfully'))
        })
      } catch (error) {
        log(`${t('disconnectError')}:`, error)
      }
    }
  }

  // publish message
  // https://github.com/mqttjs/MQTT.js#mqttclientpublishtopic-message-options-callback
  const mqttPublish = (context) => {
    if (client) {
      // topic, QoS & payload for publishing message
      const { topic, qos, payload } = context
      // Serialize payload
      const serializedPayload = typeof payload === 'string' ? payload : JSON.stringify(payload);
      client.publish(topic, serializedPayload, { qos }, (error) => {
        if (error) {
          log(`${t('publishError')}: `, error)
        }
      })
    }
  }

  const mqttSub = (subscription) => {
    if (client) {
      // topic & QoS for MQTT subscribing
      const { topic, qos } = subscription
      // subscribe topic
      // https://github.com/mqttjs/MQTT.js#mqttclientsubscribetopictopic-arraytopic-object-options-callback
      client.subscribe(topic, { qos }, (error) => {
        if (error) {
          log(`${t('subscriptionError')}`, error)
          return
        }
        log(`${t('subscribe')} to topics: ${topic}`)
        setIsSub(true)
      })
    }
  }

  // unsubscribe topic
  // https://github.com/mqttjs/MQTT.js#mqttclientunsubscribetopictopic-array-options-callback
  const mqttUnSub = (subscription) => {
    if (client) {
      const { topic, qos } = subscription
      client.unsubscribe(topic, { qos }, (error) => {
        if (error) {
          log(`${t('unsubscribeError')}`, error)
          return
        }
        log(`${t('unsubscribe')} topic: ${topic}`)
        setIsSub(false)
      })
    }
  }

  return (
    <div className="space-y-6">
      <Connection
        connect={mqttConnect}
        disconnect={mqttDisconnect}
        connectStatus={connectStatus}
      />
      <QosOption.Provider value={qosOption}>
        <Subscriber sub={mqttSub} unSub={mqttUnSub} showUnsub={isSubed} />
        <Publisher publish={mqttPublish} />
      </QosOption.Provider>
      
      {/* <Receiver payload={payload} /> */}
    </div>
  )
}

export default HookMqtt
