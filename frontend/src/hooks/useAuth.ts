export function getUser() {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
}

export function isAdmin() {
  const user = getUser();
  return user?.role === "admin";
}