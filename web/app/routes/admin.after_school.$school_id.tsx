import {
  useLoaderData,
  redirect,
  ClientLoaderFunctionArgs,
  useNavigate,
  Form,
} from "@remix-run/react";
import { getIdToken } from "~/api/auth";
import { getData } from "~/api/fetchApi";

export const clientLoader = async ({
  params,
}: ClientLoaderFunctionArgs) => {
  // データを取ってくる
  const idToken = await getIdToken();
  console.log(params)
  if (!idToken){
    return redirect(`/`)
  }else{
    const data = await getData("/after_school/" + params.school_id, idToken)
    data.idToken = idToken
    return data
  }
};

export default function Index() {
  const data = useLoaderData<typeof clientLoader>()
  if (!data.idToken){
    redirect("/");
  }
  const navigate = useNavigate()

  const Cancel = () => {
    return redirect('/admin')
  }
  const EditInstructors = (school_id:string) => {
    console.log("指導員編集")
    return navigate("../instructors/" + school_id)
  }

  return (
    <div>
      <Form>
        <div className="row">
          <div className="col">
            <p className="h3">学童情報修正</p>
          </div>
          <div className="col"></div>
        </div>
        <div className="mt-3 pl-10 pr-10">
          <div className="mb-3">
            <label htmlFor="AfterSchoolId" className="form-label mb-3">学童ID</label>
            <input type="text" className="form-control mb-3" id="AfterSchoolId" defaultValue={"0001"} />
          </div>
          <div className="mb-3">
            <label htmlFor="AfterSchoolName" className="form-label mb-3">学童名称</label>
            <input type="text" className="form-control mb-3" id="AfterSchoolName" defaultValue={"学童１"} />
          </div>
          <div className="mb-3">
            <label htmlFor="ChildrenCount" className="form-label mb-3">児童数</label>
            <input type="text" className="form-control mb-3" id="ChildrenCount" defaultValue={20} />
          </div>
          <div className="mb-3">
            <label htmlFor="InstructorCount" className="form-label mb-3">指導員数</label>
            <button type="button" className="btn btn-primary ml-3" onClick={() => EditInstructors("0001")}>指導員編集</button>
            <input type="text" className="form-control mb-3" id="InstructorCount" defaultValue={5} disabled/>
          </div>
          <div className="mb-3">
            <label htmlFor="InstructorCount" className="form-label mb-3">開所タイプ数</label>
            <button type="button" className="btn btn-primary ml-3">開所タイプ編集</button>
            <input type="text" className="form-control mb-3" id="InstructorCount" defaultValue={3} disabled/>
          </div>
          <div className="col">
            <button type="submit" className="btn btn-primary ml-2 mr-2 mt-3">保存</button>
            <button type="button" className="btn btn-secondary mt-3" onClick={Cancel}>キャンセル</button>
          </div>
        </div>
      </Form>
    </div>
  );
}
