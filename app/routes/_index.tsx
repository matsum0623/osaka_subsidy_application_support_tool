import {
  useNavigate,
  ClientLoaderFunctionArgs,
  useLoaderData,
} from "@remix-run/react";
import { getData } from "~/api/fetchApi";

export const clientLoader = async ({
  params,
}: ClientLoaderFunctionArgs) => {
  // データを取ってくる
  const today = new Date()
  const ym = !params.ym ? today.getFullYear() + '-' + ('0' + (today.getMonth() + 1)).slice(-2) : params.ym
  const data = await getData("/monthly?ym=" + ym)
  return data;
};


export default function Index() {
  const data = useLoaderData<typeof clientLoader>()
  const navigate = useNavigate();
  const editClick = (dt:string) => {
    navigate("/edit/" + dt);
  };

  return (
    <div>
      <table className="table table-bordered text-center">
        <thead>
          <tr>
              <th rowSpan={2}>日付</th>
              <th rowSpan={2}>曜日</th>
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
          {data.list.map((i:any) => (
            <tr key={i[0]}>
              <td>{i[1]}</td>
              <td>{i[2]}</td>
              <td>{i[3]}</td>
              <td>{i[4]}</td>
              <td>{i[5]}</td>
              <td>{i[6]}</td>
              <td>{i[7]}</td>
              <td>{i[8]}</td>
              <td>{i[9]}</td>
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
