import AuthorInfoDialog from "@/src/components/Ratings/Cards/RatingCard/modal/AuthorInfoDialog";
import {Typography} from "@mui/material";

const TermsDialog = ({open, author, scheme, terms, setOpen}: {
    open: boolean,
    setOpen: (value: boolean) => void,
    author: string,
    scheme: string,
    terms: { value: string, count: number }[]
}) => {
    return (<AuthorInfoDialog open={open}
                              title={<Typography>
                                  {"Автор: "}{author}<br/>
                                  {"Категория: "}{scheme}<br/>
                              </Typography>} setOpen={setOpen} dataList={terms}/>);

}

export default TermsDialog