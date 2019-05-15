const AUTH_ENDPOINT = "/.netlify/functions/auth"
document.querySelector("form").addEventListener("submit", (submitEvent:Event) => submitEvent.preventDefault())
document.querySelector("#userSubmitButton").addEventListener("click", (event:Event) => {
  event.preventDefault()
  const inputs = Array.from( document.querySelectorAll("form input")).map((i:HTMLInputElement) => [ i.name, i.value ])
  const user = inputs.find( i => i[0] === "user")[1]
  const password = inputs.find(i => i[0] === "password")[1]

  const encode = `${user}:${password}`
  const basicCred = window.btoa(encode) 

  const credentials:RequestCredentials = 'include'

  const reqInfo = {
    credentials:credentials,
    headers: {
      Authorization: `Basic ${basicCred}`
    }
  }

  XFetch(AUTH_ENDPOINT, reqInfo)
      .then(
        response => response.json(),
        (error: Error | string) => console.error(error)
      )
      .then(json => console.log(json)
      );
})

/** Fetch with timeout */
const XFetch = (input:RequestInfo, init?:XRequestInit ):Promise<Response> => {
  const DEFAULT_TIMEOUT = 5000
  const timeout = !!init && !!init.timeout? init.timeout : DEFAULT_TIMEOUT
  if (!!init && init.signal) throw new Error("Add 'controller' instead of 'signal' to init in XFetch.");
  const controller = !!init && !!init.controller? init.controller : new AbortController()
  const { signal } = controller;

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Server request timed out after ${timeout/1000} seconds`));
      controller.abort();
    }, timeout);

    fetch(input, { signal, ...init })
      .finally(() => clearTimeout(timer))
      .then(resolve, reject);
  });
};

interface XRequestInit extends RequestInit {
  timeout?:number,
  controller?:AbortController
}
