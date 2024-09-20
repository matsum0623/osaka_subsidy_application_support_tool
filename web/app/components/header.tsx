export function Header(user_data:any) {
  // 月次報告は20日締めなので、20日までは前月
  const today = new Date()
  const ym = ((today.getDate() <= 20 && today.getMonth() == 0) ? today.getFullYear()-1 : today.getFullYear()) + '-' + ('0' + ((today.getDate() <= 20) ? ((today.getMonth() == 0) ? 12 : today.getMonth()) : (today.getMonth() + 1))).slice(-2)

  return (
    <div className="container fixed-top app-header">
      <header className="d-flex flex-wrap justify-content-center py-3 border-bottom">
        <a href="/" className="d-flex align-items-center mb-3 mb-md-0 me-md-auto link-body-emphasis text-decoration-none">
          <svg className="bi me-2" width="40" height="32"><use xlinkHref="#bootstrap"/></svg>
          <span className="fs-4">月次報告作成サイト</span>
        </a>

        <ul className="nav nav-pills nav-fill">
          <li className="nav-item"><a href={"/monthly/" + ym} className="nav-link">月次報告</a></li>
          {
            user_data.admin &&
            <li className="nav-item"><a href="/admin" className="nav-link">管理画面</a></li>
          }
          <li className="nav-item"><a href="/logout" className="nav-link">ログアウト</a></li>
        </ul>
      </header>
    </div>
  );
}