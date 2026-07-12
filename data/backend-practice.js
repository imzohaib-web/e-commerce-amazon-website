//send http request to the backend and get response 
//load products from backend
const xhr = new XMLHttpRequest;

xhr.addEventListener('load', () => {
    console.log(xhr.response);
});
xhr.open('GET', 'https://supersimplebackend.dev');
xhr.send();