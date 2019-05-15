const AUTH_ENDPOINT = "/.netlify/functions/auth"
const VERIFY_ENDPOINT = "/.netlify/functions/verify"
document.querySelector("form").addEventListener("submit", (submitEvent:Event) => submitEvent.preventDefault())
document.querySelector("#userSubmitButton").addEventListener("click", (event:Event) => {
  event.preventDefault()
  const inputs = Array.from( document.querySelectorAll("form input")).map((i:HTMLInputElement) => [ i.name, i.value ])
  const user = inputs.find( i => i[0] === "user")[1]
  const password = inputs.find(i => i[0] === "password")[1]

  const encode = `${user}:${password}`
  const basicCred = window.btoa(encode) 

  const credentials:RequestCredentials = 'include'

  const authReqInfo = {
    credentials:credentials,
    headers: {
      Authorization: `Basic ${basicCred}`
    }
  }

  XFetch(AUTH_ENDPOINT, authReqInfo)
    .then( response => ({ status:response.status, text:response.text }))
    .then(
      ({status, text}) => { 
        if (status !== 200) throw `${status}:${text}`;
        else return text;
      }
    )
    .then(token => {
      const verifyReqInfo = {
        credentials: credentials,
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      XFetch(VERIFY_ENDPOINT, verifyReqInfo)
        .then(tap("receiving verification"))
        .then(
          response => response.text(),
          (error: Error | string) => console.error(error)
        )
        .then(text => console.log("verified claims", text));
    })
    .catch(reason => console.error(formatReason(reason)));
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

const formatReason = (error: Error | string) =>
  typeof error === "string" ? error : `${error.name}:${error.message}`;

const tap = message => arg => {
  console.log(message, arg)
  return arg
}