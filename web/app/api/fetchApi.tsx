import config from "~/config.json"

export async function fetchApi(path:string, opt:object) {
    return await fetch(config.maiApi + path, opt)
    .then(
        (response) => (response.json())
    ).then(
        (j) => j.data
    )
}

export async function getData(path:string, idToken:string) {
    return await fetchApi(path, {
        method: "GET",
        headers: new Headers({'Authorization': idToken}),
    })
}

export async function postData(path:string, postData:object, idToken:string) {
    return await fetchApi(path, {
        method: "POST",
        headers: new Headers({'Authorization': idToken}),
        body: JSON.stringify(postData),
    })
}

export async function putData(path:string, postData:object, idToken:string) {
    return await fetchApi(path, {
        method: "PUT",
        headers: new Headers({'Authorization': idToken}),
        body: JSON.stringify(postData),
    })
}

export async function deleteData(path:string, postData:object, idToken:string) {
    return await fetchApi(path, {
        method: "DELETE",
        headers: new Headers({'Authorization': idToken}),
        body: JSON.stringify(postData),
    })
}