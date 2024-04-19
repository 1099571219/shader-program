type EventCallback<T> = (data: T) => void;

class EventBus<T> {
  private listeners: { [key: string]: EventCallback<T>[] } = {};

  on(event: string, callback: EventCallback<T>) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event: string, callback: EventCallback<T>) {
    if (!this.listeners[event]) {
      return;
    }
    const callbackIndex = this.listeners[event].indexOf(callback);
    if (callbackIndex > -1) {
      this.listeners[event].splice(callbackIndex, 1);
    }
  }

  emit(event: string, data: T) {
    if (!this.listeners[event]) {
      return;
    }
    this.listeners[event].forEach(listener => {
      listener(data);
    });
  }
}

// 使用示例
const eventBus = new EventBus<any>();
export default eventBus
// // 订阅事件
// eventBus.on('update', (data: string) => {
//   console.log(`Received update: ${data}`);
// });

// // 发布事件
// eventBus.emit('update', 'New data available');