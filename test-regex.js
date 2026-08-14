const url2 = "https://res.cloudinary.com/diewalae4/image/upload/f_webp,q_auto,w_256,h_256,c_fill-center/v1786624142/1000134293_sbicyb.png";
const replaceOg = (url) => url.replace(/\/upload\/(?:[a-zA-Z0-9_.,-]+\/)*(v\d+\/)/, '/upload/f_jpg,q_auto,w_1200,h_630,c_fill/$1');
console.log(replaceOg(url2));
