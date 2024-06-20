import config from "~/config.json"

export async function fetchApi(path:string, opt:object) {
    return await fetch(config.maiApi + path, opt)
    .then(
        (response) => (response.json())
    ).then(
        (j) => j.data
    )
}

export async function getData(path:string) {
    return await fetchApi(path, {
        method: "GET",
    })
}

export async function postData(path:string, postData:object) {
    return await fetchApi(path, {
        method: "POST",
        body: JSON.stringify(postData),
    })
}