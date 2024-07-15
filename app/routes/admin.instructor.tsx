import {
  useLoaderData,
  redirect,
  useOutletContext,
} from "@remix-run/react";
import { getIdToken } from "~/api/auth";

export const clientLoader = async () => {
  // データを取ってくる
  const idToken = await getIdToken();
  if (!idToken){
    return redirect(`/`)
  }else{
    return {
      idToken: idToken,
      instructors: [
        {
          id: '0001',
          name: '指導員１',
          qualification: true,
          additional: true,
          medical_care: false,
        }
      ]
    };
  }
};

export default function Index() {
  const data = useLoaderData<typeof clientLoader>()
  if (!data.idToken){
    redirect("/");
  }
  const parent_data = useOutletContext()
  return (
    <div>
      <div className="mt-2">
        <select className="form-select" name="after_school" onSelect={(e) => (console.log(e.target))} onChange={(e) => (console.log(e.target.value))}>
          {parent_data.after_schools.map((item:any) => (
            <option key={item.school_id} value={item.school_id} >{item.school_id + ' ' + item.school_name}</option>
          ))}
        </select>
      </div>
      <table className="table table-bordered text-center mt-3">
        <thead>
          <tr>
            <td>氏名</td>
            <td>指導員資格</td>
            <td>障害加算</td>
            <td>医ケア</td>
            <td></td>
          </tr>
        </thead>
        <tbody>
          {data.instructors.map((ins:any) => (
            <tr key={ins.id}>
              <td className="align-middle">{ins.name}</td>
              <td className="align-middle">{ins.qualification && '○'}</td>
              <td className="align-middle">{ins.additional && '○'}</td>
              <td className="align-middle">{ins.medical_care && '○'}</td>
              <td><button className="btn btn-primary" onClick={(e) => (console.log(e))}>編集</button></td>
            </tr>
          ))}

        </tbody>
      </table>

    </div>
  );
}
