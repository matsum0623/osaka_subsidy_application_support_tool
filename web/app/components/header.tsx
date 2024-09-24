import { Form } from "@remix-run/react";

export function Header(user_data:any) {
  // 月次報告は20日締めなので、20日までは前月
  const today = new Date()
  const school_id = user_data.after_schools[0].school_id
  const ym = ((today.getDate() <= 20 && today.getMonth() == 0) ? today.getFullYear()-1 : today.getFullYear()) + '-' + ('0' + ((today.getDate() <= 20) ? ((today.getMonth() == 0) ? 12 : today.getMonth()) : (today.getMonth() + 1))).slice(-2)

  return (
    <div className="container fixed-top app-header">
      <header className="d-flex flex-wrap justify-content-center py-3 border-bottom">
        <a href="/" className="d-flex align-items-center mb-3 mb-md-0 me-md-auto link-body-emphasis text-decoration-none">
          <svg className="bi me-2" width="40" height="32"><use xlinkHref="#bootstrap"/></svg>
          <span className="fs-4">月次報告作成サイト</span>
        </a>

        <ul className="nav nav-pills nav-fill">
          <li className="nav-item"><a href={"/monthly/" + school_id + '/' + ym} className="nav-link">月次報告</a></li>
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

export function MonthlyHeader(data:any, anchorRef:any, school_id:string, ym:string, changeSchoolId:any, changeMonth:any, downloadCsv:any, params:any) {
  if (params.length < 3 || (params.length == 3 && !params[2].pathname.includes('/edit/'))){
    return (
      <Form>
      <div className="d-flex">
        <div className="p-2">
          <select name="school_id" className="form-select" defaultValue={data.school_id} onChange={(e) => changeSchoolId(e.target.value)}>
            {data.user_data.after_schools.map((item:any) => (
              <option key={item.school_id} value={item.school_id}>{item.school_id + ':' + item.school_name}</option>
            ))}
          </select>
        </div>
        <div className="p-2">
          <select name="ym" className="form-select" defaultValue={data.ym} onChange={(e) => (changeMonth(e.target.value), e)}>
            {data.ym_list.map((item:any) => (
              <option key={item.value} value={item.value}>{item.value.split('-').join('年') + '月' + (item.confirm ? ' 確定済み' : '')}</option>
            ))}
          </select>
        </div>
        <div className="ms-auto p-2" hidden={false}>
          <button type="button" onClick={() => downloadCsv(school_id, ym, data.idToken, anchorRef)} className="btn btn-primary ml-10">CSVダウンロード</button>
          <a ref={anchorRef} className='hidden'></a>
        </div>
      </div>
    </Form>
    )
  }
}