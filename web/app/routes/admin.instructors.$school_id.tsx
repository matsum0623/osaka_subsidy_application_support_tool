import {
  useLoaderData,
  redirect,
  ClientLoaderFunctionArgs,
  Form,
  useNavigate,
} from "@remix-run/react";
import { useState } from "react";
import { getIdToken } from "~/api/auth";
import { getData, putData, postData, deleteData } from "~/api/fetchApi";

export const clientLoader = async ({
  params,
}: ClientLoaderFunctionArgs) => {
  // データを取ってくる
  const idToken = await getIdToken();
  if (!idToken){
    return redirect(`/`)
  }else{
    const data = await getData("/after_school/" + params.school_id + '/instructors', idToken)
    data.idToken = idToken
    data.school_id = params.school_id
    return data
  }
};

export const clientAction = async () => {
  console.log("clientAction")
}


export default function Index() {
  const data = useLoaderData<typeof clientLoader>()
  if (!data.idToken){
    redirect("/");
  }

  const navigate = useNavigate()

  const handleSubmit = async (e:any) => {
    const post_data = {
      instructor_id: instructorId,
      instructor_Name: instructorName,
      qualification: qualification,
      additional: additional,
      medical_care: medicalCare,
      modal_type: modalType,
    }
    e.preventDefault();
    if(modalType == "add"){
      await postData("/after_school/" + data.school_id + '/instructors', post_data, data.idToken)
    }else if(modalType == "edit"){
      await putData("/after_school/" + data.school_id + '/instructors', post_data, data.idToken)
    }
    navigate('./')
  }

  const handleDeleteSubmit = async (e:any) => {
    e.preventDefault();
    const post_data = {
      instructor_id: instructorId,
      instructor_Name: instructorName,
    }
    await deleteData("/after_school/" + data.school_id + '/instructors', post_data, data.idToken)
    navigate('./')
  }

  const [instructorId, setInstructorId] = useState<string>("")
  const [instructorName, setInstructorName] = useState<string>("")
  const [qualification, setQualification] = useState<boolean>(false)
  const [additional, setAdditional] = useState<boolean>(false)
  const [medicalCare, setMedicalCare] = useState<boolean>(false)
  const [modalType, setModalType] = useState<string>("add")

  const openModal = (id:string, name:string, qualify:boolean, add:boolean, medical:boolean, type:string) => {
    setInstructorId(id)
    setInstructorName(name)
    setQualification(qualify)
    setAdditional(add)
    setMedicalCare(medical)
    setModalType(type)
  }

  const openDeleteConfirmModal = (id:string, name:string) => {
    setInstructorId(id)
    setInstructorName(name)
  }

  return (
    <div>
      <Form onSubmit={(e) => handleSubmit(e)}>
        <div className="modal" id="add_modal" tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">指導員追加</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div className="modal-body">
              <div className="mb-3">
                <label htmlFor="InstructorIdInput" className="form-label">指導員ID</label>
                <input type="text" name="instructor_id" className="form-control" id="InstructorIdInput" placeholder="指導員ID" value={instructorId} required onChange={(e) => setInstructorId(e.target.value)}/>
              </div>
              <div className="mb-3">
                <label htmlFor="InstructorNameInput" className="form-label">指導員氏名</label>
                <input type="text" name="instructor_name" className="form-control" id="InstructorNameInput" placeholder="指導員氏名" value={instructorName} required onChange={(e) => setInstructorName(e.target.value)}/>
              </div>
              <div className="form-check">
                <input className="form-check-input" type="checkbox" name="qualification" id="CheckQualification" checked={qualification} onChange={() => setQualification(!qualification)}/>
                <label className="form-check-label" htmlFor="CheckQualification">指導員資格</label>
              </div>
              <div className="form-check">
                <input className="form-check-input" type="checkbox" name="additional" id="CheckAdditional" checked={additional} onChange={() => setAdditional(!additional)}/>
                <label className="form-check-label" htmlFor="CheckAdditional">加配職員</label>
              </div>
              <div className="form-check">
                <input className="form-check-input" type="checkbox" name="additional" id="CheckMedicalCare" checked={medicalCare} onChange={() => setMedicalCare(!medicalCare)}/>
                <label className="form-check-label" htmlFor="CheckMedicalCare">医ケア</label>
              </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">キャンセル</button>
                <button type="submit" className="btn btn-primary" data-bs-dismiss="modal">登録</button>
              </div>
            </div>
          </div>
        </div>
      </Form>

      <Form onSubmit={(e) => handleDeleteSubmit(e)}>
        <div className="modal" id="delete_modal" tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">指導員削除</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">[{instructorId}:{instructorName}]を削除します。よろしいですか？</div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">キャンセル</button>
                <button type="submit" className="btn btn-danger" data-bs-dismiss="modal">削除</button>
              </div>
            </div>
          </div>
        </div>
      </Form>
      <div className="row justify-content-start">
        <div className="col-3">
          <p className="h3">指導員情報修正</p>
        </div>
        <div className="col">
          <button type="button" value={"追加"} className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#add_modal" onClick={() => openModal("","",false,false,false,"add")}>追加</button>
          </div>
      </div>
      <table className="table table-bordered text-center mt-3">
        <thead>
          <tr>
            <td>指導員ID</td>
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
              <td className="align-middle">{ins.id}</td>
              <td className="align-middle">{ins.name}</td>
              <td className="align-middle">{ins.qualification && '○'}</td>
              <td className="align-middle">{ins.additional && '○'}</td>
              <td className="align-middle">{ins.medical_care && '○'}</td>
              <td><button className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#add_modal"  onClick={() => (openModal(ins.id, ins.name, ins.qualification, ins.additional, ins.medical_care, "edit"))}>編集</button></td>
              <td><button className="btn btn-danger" data-bs-toggle="modal" data-bs-target="#delete_modal"  onClick={() => (openDeleteConfirmModal(ins.id, ins.name))}>削除</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
