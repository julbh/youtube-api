import {useRouter} from "next/router";

function DetailPage() {
    const {id} = useRouter().query;
    return(
        <div>
            {id}
        </div>
    )
}

export default DetailPage
