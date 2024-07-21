
export function Loading(navigation) {
  if (navigation.state === "loading" || navigation.state === "submitting"){
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-white opacity-50 loading">
        <div className="spinner-border" role="status" id="loading">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }
}

export const weekday = ['日', '月', '火', '水', '木', '金', '土', ]
