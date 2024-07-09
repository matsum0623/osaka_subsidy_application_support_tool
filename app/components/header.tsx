export function Header(user_data:any) {
  return (
    <div className="container">
      <header className="d-flex flex-wrap justify-content-center py-3 mb-4 border-bottom">
        <a href="/" className="d-flex align-items-center mb-3 mb-md-0 me-md-auto link-body-emphasis text-decoration-none">
          <svg className="bi me-2" width="40" height="32"><use xlinkHref="#bootstrap"/></svg>
          <span className="fs-4">月次報告作成サイト</span>
        </a>

        <ul className="nav nav-pills">
          <li className="nav-item"><a href="/monthly" className="nav-link">月次報告</a></li>
          {
            !user_data.admin &&
            <li className="nav-item"><a href="/admin" className="nav-link">管理画面</a></li>
          }
          <li className="nav-item"><a href="/logout" className="nav-link">ログアウト</a></li>
        </ul>
      </header>
    </div>
  );
}