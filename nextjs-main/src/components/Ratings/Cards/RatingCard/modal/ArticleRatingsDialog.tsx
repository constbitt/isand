import AuthorInfoDialog from "@/src/components/Ratings/Cards/RatingCard/modal/AuthorInfoDialog";
import {Typography} from "@mui/material";

const ArticleRatingsDialog = ({open, author, scheme, articleRatings, setOpen}: {
    open: boolean,
    setOpen: (value: boolean) => void,
    author: string,
    scheme: string,
    articleRatings: { value: string, count: number }[]
}) => {
    return (<AuthorInfoDialog open={open}
                              title={<Typography width={"100%"}>
                                  {"Автор: "}{author}<br/>
                                  {"Категория: "}{scheme}<br/><br/>
                                  <Typography textAlign={"center"}
                                              width={"100%"}>{"Рейтинг повлиявших на категорию статей"}</Typography>
                              </Typography>} setOpen={setOpen} dataList={articleRatings}/>);

}

export default ArticleRatingsDialog