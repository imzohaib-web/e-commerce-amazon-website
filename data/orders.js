export let orders = JSON.parse(localStorage.getItem('orders')) || [];

function saveToStorage() {
  localStorage.setItem('orders', JSON.stringify(orders));
}

export function addOrder(order) {
  orders.unshift(order);
  saveToStorage();
}

export function deleteOrder(orderId) {
  orders = orders.filter((order) => order.id !== orderId);
  saveToStorage();
}

export function getOrder(orderId) {
  return orders.find((order) => order.id === orderId);
}
