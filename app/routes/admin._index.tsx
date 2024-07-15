import {
  useLoaderData,
  redirect,
  useNavigate,
} from "@remix-run/react";
import { getIdToken } from "~/api/auth";
import { getData } from "~/api/fetchApi";

export const clientLoader = async () => {
  const idToken = await getIdToken();
  if (!idToken){
    return redirect(`/`)
  }else{
    const data = await getData("/user", idToken)
    data.idToken = idToken
    data.after_schools = await getData("/after_school", idToken)
    return data
  }
};

export default function Index() {
  const data = useLoaderData<typeof clientLoader>()
  if (!data.idToken){
    redirect("/");
  }

  const navigate = useNavigate()

  const AddAfterSchool = () => {
    console.log("学童追加")
  }

  const EditAfterSchool = (school_id:string) => {
    console.log("学童編集/" + school_id)
    navigate('./after_school/' + school_id)
  }

  return (
    <div>
      <div className="row">
        <div className="col">
          <p className="h3">学童一覧</p>
        </div>
        <div className="col"></div>
        <div className="col">
          <button className="btn btn-primary" onClick={AddAfterSchool}>学童追加</button>
        </div>
      </div>
      <table className="table table-bordered text-center mt-3">
        <thead>
          <tr>
            <td>学童ID</td>
            <td>学童名</td>
            <td></td>
          </tr>
        </thead>
        <tbody>
          {data.after_schools.list.map((afs:any) => (
            <tr key={afs.school_id}>
              <td className="align-middle">{afs.school_id}</td>
              <td className="align-middle">{afs.school_name}</td>
              <td><button className="btn btn-primary" onClick={() => EditAfterSchool(afs.school_id)}>編集</button></td>
            </tr>
          ))}

        </tbody>
      </table>

    </div>
  );
}
