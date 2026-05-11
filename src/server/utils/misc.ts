export function safeLog(msg: string): void {
  if (typeof Logger !== 'undefined') {
    Logger.log(msg);
  }
}
