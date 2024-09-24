import {
  useNavigate,
  useLoaderData,
  redirect,
  Outlet,
  ClientLoaderFunctionArgs,
  Form,
  useMatches,
} from "@remix-run/react";
import { getData } from "~/api/fetchApi";
import { getIdToken } from "~/api/auth";
import { Header, MonthlyHeader } from "~/components/header";
import { useRef, useState } from "react";
import { getSession, commitSession } from "~/lib/session";
import Encoding from 'encoding-japanese';

export const clientLoader = async ({
  params,
  request
}: ClientLoaderFunctionArgs) => {
  const idToken = await getIdToken();
  if (!idToken){
    return redirect(`/`)
  }

  const today = new Date()
  const today_year = today.getFullYear()
  const today_month = today.getMonth() + 1
  const data = await getData("/user", idToken)
  data.idToken = idToken
  data.ym = params.ym
  data.school_id = params.school_id
  data.ym_list = []
  for(let i=0; i < 13; i++){
    data.ym_list.push({
      value: ((i<=today_month) ? today_year : today_year-1) + '-' + ('0' + ( (i < today_month) ? today_month - i : today_month - i + 12)).slice(-2),
      confirm: false
    })
  }
  return data
};

export const downloadCsv = async (school_id:string, ym:string, idToken:string, anchorRef:any) => {
  const data = await getData("/monthly?ym=" + ym + '&school_id=' + school_id, idToken)
  const blob = new Blob([
    new Uint8Array(
      Encoding.convert(Encoding.stringToCode(data.list.map((row:any) => ([
        ...row.slice(0,1),
        ...row.slice(4,11),
        ...row.slice(12),
      ]).join(',')).join('\n')), {
        from: 'UNICODE',
        to: 'SJIS',
      })
    )
  ], {type: 'text/csv;charset=cp932;'})
  const link = anchorRef.current
  link.setAttribute('href', URL.createObjectURL(blob))
  link.setAttribute('download', 'test.csv')
  link.click()
}

export default function Index() {
  const data = useLoaderData<typeof clientLoader>()
  const navigate = useNavigate();
  if (!data.idToken){
    redirect("/");
  }
  const [ym, setDate] = useState(data.ym)
  const [school_id, setSchoolId] = useState(data.school_id)

  const changeMonth = (ym:string) => {
    setDate(ym)
    return navigate("/monthly/" + school_id + "/" + ym);
  }

  const changeSchoolId = (school_id:string) => {
    setSchoolId(school_id)
    return navigate("/monthly/" + school_id + "/" + ym);
  }

  const dialogRef = useRef<HTMLDialogElement>(null);
  const openDialog = () => {
    if (dialogRef.current) {
      dialogRef.current.showModal();
    }
  };

  const anchorRef  = useRef<HTMLAnchorElement>(null)
  const params = useMatches()

  return (
    <div>
      {Header(data.user_data)}
      <div className="monthly-header">
        {
          (params.length < 3 || (params.length == 3 && !params[2].pathname.includes('/edit/'))) &&
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
        }
        {/* TODO: 確定処理は未実装
        <div>
          <button type="button" value={"確定"} className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#confirm_modal" onClick={() => openDialog()}>確定処理</button>
        </div>
        */}
      </div>
      <Outlet context={[school_id, ym]}/>
    </div>
  );
}
