const baseUrl = "https://auth.nomoreparties.co";

function getResponse(res) {
   return res.ok ? res.json() : Promise.reject(`Ошибка: ${res.status}`);
}


export function register (password, email)  {
  return fetch(`${baseUrl}/signup`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      password,
      email,
    })
  })
  .then((res) => getResponse(res));
};


export function getUser(token) {
    return fetch(`${baseUrl}/users/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      }
    })
    .then((res) => getResponse(res));
  };


export const authorization = (password, email) => {
  return fetch(`${baseUrl}/signin`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      password,
      email,
    })
  })
  .then((res) => getResponse(res));
};

export const login = (password, email) => {
  return fetch(`${baseUrl}/signin`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      password,
      email,
    }),
  }).then((res) => getResponse(res));
};