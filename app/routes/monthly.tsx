import {
  useNavigate,
  ClientLoaderFunctionArgs,
  useLoaderData,
  redirect,
} from "@remix-run/react";
import { getData } from "~/api/fetchApi";
import { getIdToken } from "~/api/auth";

export const signUp = () => {}

export const clientLoader = async ({
  request,
}: ClientLoaderFunctionArgs) => {
  // データを取ってくる
  const idToken = await getIdToken();
  if (!idToken){
    return redirect(`/`)
  }else{
    const today = new Date()
    const url = new URL(request.url);
    const ym = !url.searchParams.get("ym") ? today.getFullYear() + '-' + ('0' + (today.getMonth() + 1)).slice(-2) : url.searchParams.get("ym")
    const data = await getData("/monthly?ym=" + ym)
    return {
      idToken: idToken,
      list: data.list,
      config: data.config,
    };
  }
};

export default function Index() {
  const data = useLoaderData<typeof clientLoader>()
  const navigate = useNavigate();
  if (!data.idToken){
    redirect("/");
  }
  const editClick = (dt:string) => {
    navigate("/edit/" + dt);
  };

  const weekday = ['日', '月', '火', '水', '木', '金', '土', ]

  return (
    <div>
      <table className="table table-bordered table-hover text-center">
        <thead>
          <tr>
              <th rowSpan={2}>日付</th>
              <th rowSpan={2}>曜日</th>
              <th rowSpan={2}>開所<br/>種別</th>
              <th colSpan={3}>児童数</th>
              <th colSpan={2}>開所時職員数</th>
              <th colSpan={2}>閉所時職員数</th>
              <th rowSpan={2}></th>
          </tr>
          <tr>
              <th></th>
              <th>内、障がい児</th>
              <th>内、医ケア児</th>
              <th>支援員数</th>
              <th>支援員以外</th>
              <th>支援員数</th>
              <th>支援員以外</th>
          </tr>
        </thead>

        <tbody>
          {data.list?.map((i:any) => (
            <tr key={i[0]} className={i[2]==6 ? "table-info" : (i[2]==0 ? "table-danger" : "")}>
              <td>{i[1]}</td>
              <td>{weekday[i[2]]}</td>
              <td>{data.config.open_types[i[3]]?.TypeName}</td>
              <td>{i[4]}</td>
              <td>{i[5]}</td>
              <td>{i[6]}</td>
              <td>{i[7]}</td>
              <td>{i[8]}</td>
              <td>{i[9]}</td>
              <td>{i[10]}</td>
              <td>
                <button type="button" className="btn btn-primary" onClick={() => editClick(i[0])}>
                  入力
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
