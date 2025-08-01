import mqttService from '@/services/mqtt.js';
import { v4 as uuidv4 } from 'uuid';

const printCommand = {
    selfTest: 'SELFTEST \r\n',
}

const cmdPrint = (command,client_id)=>{
    const topic = `soticlone/${client_id}/user/server/print`
    const task_id = uuidv4()
    const data = {
        taskId: task_id,
        content: command
    }
    mqttService.sendMessage(topic, JSON.stringify(data));
}


export default {
    printCommand,
    cmdPrint
}