let counter = 0;
export function newTurnId(): string {
  counter++;
  return `t-${Date.now().toString(36)}-${counter}`;
}
