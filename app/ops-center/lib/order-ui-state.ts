export function getOrderAge(createdAt: string) {
  const now = Date.now();
  const time = new Date(createdAt).getTime();
  return (now - time) / 60000; // minutos
}

export function getOrderColor(order: any) {
  const age = getOrderAge(order.createdAt);

  if (order.type === "RESERVATION") {
    return "border-purple-500 bg-purple-50";
  }

  if (age < 5) return "border-blue-400 bg-blue-50";
  if (age < 30) return "border-orange-400 bg-orange-50";
  return "border-red-500 bg-red-50";
}