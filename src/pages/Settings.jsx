import React from 'react'
import mqtt from 'mqtt';

const Settings = () => {

    let client;

    // 打印测试用例
    const printSample = `
        SELFTEST PRINT 1\r\n
    `
    

    // log 功能
    const log = (message) => {
        const logElement = document.getElementById('log1');
        if (logElement) {
            logElement.textContent += `${new Date().toLocaleTimeString()}: ${message}\n`;
            logElement.scrollTop = logElement.scrollHeight; // 滚动到最新日志
        }
    };

    React.useEffect(() => {
        const form = document.getElementById('control-form');
        if (form) {
            form.addEventListener('submit', function(e){
                e.preventDefault();
                const broker = document.getElementById('broker1').value;
                const port = document.getElementById('port1').value;
                const clientId = document.getElementById('clientId1').value;
                const topic = document.getElementById('topic1').value;
                const url = `ws://${broker}:${port}/mqtt`;

                // Task ID
                const taskId = clientId + Math.random().toString(16).slice(2, 10);

                // 如果之前有连接，先断开
                if (client) {
                    client.end();
                }
                client = mqtt.connect(url, {
                    clientId: clientId,
                });

                //连接成功
                client.on('connect',() => {
                    log(`✅ 连接成功: ${url}`);
                    document.getElementById('status1').textContent = '已连接';
                    document.getElementById('controls1').style.display = 'flex';
                    document.getElementById('connectControl').disabled = true;
                    document.getElementById('connectControl').textContent = '已连接';
                })

                // 连接失败
                client.on('error', (err) => {
                    log(`❌ 连接失败: ${err.message}`);
                    client.end();
                    document.getElementById('status1').textContent = '连接失败';
                    document.getElementById('controls1').style.display = 'none';
                    document.getElementById('connectControl').disabled = false;
                    document.getElementById('connectControl').textContent = '连接';
                });

                // 断开连接
                document.getElementById('disconnectBtn1').addEventListener('click', () => {
                    if (client) {
                        client.end();
                        log('🔌 已断开连接');
                        document.getElementById('status1').textContent = '未连接';
                        document.getElementById('controls1').style.display = 'none';
                        document.getElementById('connectControl').disabled = false;
                        document.getElementById('connectControl').textContent = '连接';
                    }
                });

                // 发送打印命令
                document.getElementById('printBtn').addEventListener('click', () => {
                    if (client && client.connected) {
                        const messageObj = {
                            taskId: taskId,
                            content: printSample
                        };
                        client.publish(topic, JSON.stringify(messageObj), { qos: 1 }, (err) => {
                            if (err) {
                                log(`❌ 发送打印命令失败: ${err.message}`);
                            } else {
                                log(`✅ 打印命令已发送: ${JSON.stringify(messageObj)}`);
                            }
                        });
                    } else {
                        log('❌ 无法发送打印命令，未连接到 Broker');
                    }
                });





            })
        }
        // Cleanup
        return () => {
            if (form) {
                form.removeEventListener('submit', () => {});
            }
        };
    }, []);


    return (
        <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Broker 配置</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* 系统配置 */}
                <div className="space-y-6">
                    <form id="control-form" className="space-y-4">
                        <div className="flex flex-col">
                            <label className="text-sm text-gray-600 mb-1" htmlFor="broker1">Broker 地址</label>
                            <input
                                type="text"
                                id="broker1"
                                defaultValue="broker.emqx.io"
                                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-sm text-gray-600 mb-1" htmlFor="port1">端口</label>
                            <input
                                type="number"
                                id="port1"
                                defaultValue="8083"
                                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-sm text-gray-600 mb-1" htmlFor="clientId1">Client ID</label>
                            <input
                                type="text"
                                id="clientId1"
                                defaultValue="mqttxp421bwebapp"
                                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-sm text-gray-600 mb-1" htmlFor="topic1">Topic</label>
                            <input
                                type="text"
                                id="topic1"
                                defaultValue="mqttxp421b/server/print"
                                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <button
                            id="connectControl"
                            type="submit"
                            className="bg-blue-600 text-white rounded-lg px-4 py-2 font-semibold hover:bg-blue-700 transition"
                        >
                            连接
                        </button>
                    </form>
                </div>
                {/* 日志 */}
                <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-800">日志</h3>
                    <div className="space-y-4">
                        <div id="status1" className="text-sm text-gray-700">未连接</div>
                        <div id="controls1" className="flex gap-2" style={{ display: 'none' }}>
                            <button
                                id="printBtn"
                                className="bg-green-500 text-white rounded-lg px-4 py-2 font-semibold hover:bg-green-600 transition"
                            >
                                发送打印命令
                            </button>
                            <button
                                id="disconnectBtn1"
                                className="bg-red-500 text-white rounded-lg px-4 py-2 font-semibold hover:bg-red-600 transition"
                            >
                                断开连接
                            </button>
                        </div>
                        <pre
                            id="log1"
                            className="bg-gray-100 rounded-lg p-2 text-xs text-gray-800"
                            style={{
                                maxHeight: '240px',
                                overflowY: 'auto',
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-all'
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Settings