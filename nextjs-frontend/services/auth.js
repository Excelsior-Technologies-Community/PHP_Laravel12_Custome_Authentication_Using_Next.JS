export function logoutUser(router) {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");

    router.push("/login");
}