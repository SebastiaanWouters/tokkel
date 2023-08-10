const TENOR_API_KEY = 'AIzaSyC3dz8fJji8jD2ns8_IbBgssjAHKwh5OTI'
const limit = 10


async function fetchGIFs(key: string) {
     var search_url = "https://tenor.googleapis.com/v2/search?q=" + key + "&key=" +
            TENOR_API_KEY +"&client_key=" + TENOR_API_KEY +  "&limit=" + limit;


    const result = await fetch(search_url);
    const json = await result.json();
    return json;
}

(async () => {const res = await fetchGIFs("test"); console.log("GIIIIIIFFFFFFFSSSSSSSSS", res.results[0].url) })()

export { fetchGIFs }