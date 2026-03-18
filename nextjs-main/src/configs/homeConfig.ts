import ProfilesImg from "@/src/assets/images/home/profiles.svg";
import RatingsImg from "@/src/assets/images/home/ratings.svg";
import GraphImg from "@/src/assets/images/home/graphs.svg";
import ThesaurusImg from "@/src/assets/images/home/thesaurus.svg";
import DistanceImg from "@/src/assets/images/home/distances.svg";
import SearchImg from "@/src/assets/images/home/search.svg";
import DeepsearchImg from "@/src/assets/images/home/deepSearch.svg";
import GlossaryImg from "@/src/assets/images/home/glossary.svg";
import EvolIcon from "@/src/assets/images/home/chart.svg";
import AnalysisImg from "@/src/assets/images/home/analysis.svg";
import ClusterImg from "@/src/assets/images/home/cluster.svg";
import {Card} from "@/src/store/types/homeTypes";

export const cards: readonly Card[] = [
    {
        name: 'Тематический\n поиск',
        text: 'Поиск публикаций, ученых, журналов, конференций, организаций и городов по заданным параметрам',
        link: '/deepSearch',
        src: DeepsearchImg,
    },
         {
         name: 'Текстовый\n поиск',
         text: 'Поиск ученых и публикаций на основании введенного слова или фразы',
         link: '/search',
         src: SearchImg,
     },
    {
        name: 'Тематические\n профили',
        text: 'Профили ученых, журналов, конференций, организаций, городов',
        link: '/profiles',
        src: ProfilesImg,
    },

    {
        name: 'Тематическое\n ранжирование',
        text: 'Ранжированный список ученых по заданным параметрам',
        link: '/ratings',
        src: RatingsImg,
    },
    {
        name: 'Граф\n классификатора',
        text: 'Профиль ученого в виде графа, показывающего плотность занятости той или иной деятельностью',
        link: '/graphs',
        src: GraphImg,
    },
    {
        name: 'Граф\n глоссария',
        text: 'Граф взаимосвязи используемых терминов теории управления для выбранного ученого',
        link: '/thesaurus',
        src: ThesaurusImg,
    },
    // {
    //     name: 'Расстояния',
    //     text: 'Позволяет визуализировать на двумерной проекции профилей тематическую близость учёных, конференций и журналов',
    //     link: '/distances',
    //     src: DistanceImg,
    // },
    {
        name: 'Глоссарий',
        text: 'Список терминов теории управления и их определения',
        link: '/glossary',
        src: GlossaryImg,
    },

        {
        name: 'Эволюция и прогноз интересов',
        text: 'Эволюция интересов автора с дальнейшим прогнозом развития',
        link: '/insights',
        src: EvolIcon,
    },

    {
        name: 'Кластеризация',
        text: '',
        link: '/cluster',
        src: ClusterImg,
    },

        {
        name: 'Интеллектуальный анализ статей',
        text: 'Семантический анализ загруженной пользователем статьи',
        link: '/articleAnalysis',
        src: AnalysisImg,
    },


]

export const mainLinks: readonly Card[] = [
    {
        name: 'Список\n авторов',
        text: 'Полный список ученых',
        link: '/authors',
        src: GraphImg,
    },
    {
        name: 'Список\n публикаций',
        text: 'Полный список публикаций',
        link: '/publications',
        src: ThesaurusImg,
    },

    {
        name: 'tmpPage',
        text: 'Временная страница',
        link: '/tmpPage',
        src: ThesaurusImg,
    }
]