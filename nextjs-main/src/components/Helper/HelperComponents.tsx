import Image from "next/image";
import { FC, ReactElement } from "react";
import Pic2 from "@/src/assets/images/helper/рисунок 2.svg";
import Pic3 from "@/src/assets/images/helper/рисунок 3.svg";
import Pic4 from "@/src/assets/images/helper/рисунок 4.svg";
import Pic5 from "@/src/assets/images/helper/рисунок 5.svg";
import Pic6 from "@/src/assets/images/helper/рисунок 6.svg";
import Pic7 from "@/src/assets/images/helper/рисунок 7.svg";
import Pic8 from "@/src/assets/images/helper/рисунок 8.svg";
import Pic9 from "@/src/assets/images/helper/рисунок 9.svg";
import Pic10 from "@/src/assets/images/helper/рисунок 10.svg";
import Pic11 from "@/src/assets/images/helper/рисунок 11.svg";
import Pic12 from "@/src/assets/images/helper/рисунок 12.svg";
import Pic13 from "@/src/assets/images/helper/рисунок 13.svg";
import Pic14 from "@/src/assets/images/helper/рисунок 14.svg";
import Pic15 from "@/src/assets/images/helper/рисунок 15.svg";
import Pic16 from "@/src/assets/images/helper/рисунок 16.svg";
import Pic17 from "@/src/assets/images/helper/рисунок 17.svg";
import Pic18 from "@/src/assets/images/helper/рисунок 18.svg";
import Pic19 from "@/src/assets/images/helper/рисунок 19.svg";
import Pic20 from "@/src/assets/images/helper/рисунок 20.svg";
import Pic21 from "@/src/assets/images/helper/рисунок 21.svg";
import Pic22 from "@/src/assets/images/helper/рисунок 22.svg";
import Pic23 from "@/src/assets/images/helper/рисунок 23.svg";
import Pic24 from "@/src/assets/images/helper/рисунок 24.svg";
import Pic25 from "@/src/assets/images/helper/рисунок 25.svg";
import Pic26 from "@/src/assets/images/helper/рисунок 26.svg";
import Pic27 from "@/src/assets/images/helper/рисунок 27.svg";
import Pic28 from "@/src/assets/images/helper/рисунок 28.svg";
import Pic29 from "@/src/assets/images/helper/рисунок 29.svg";
import Pic30 from "@/src/assets/images/helper/рисунок 30.svg";
import Pic31 from "@/src/assets/images/helper/рисунок 31.svg";
import Pic32 from "@/src/assets/images/helper/рисунок 32.svg";
import Pic33 from "@/src/assets/images/helper/рисунок 33.svg";
import Pic34 from "@/src/assets/images/helper/рисунок 34.svg";
import Pic35 from "@/src/assets/images/helper/рисунок 35.svg";
import Pic36 from "@/src/assets/images/helper/рисунок 36.svg";
import Pic37 from "@/src/assets/images/helper/рисунок 37.svg";
import Pic38 from "@/src/assets/images/helper/рисунок 38.svg";
import Pic39 from "@/src/assets/images/helper/рисунок 39.svg";
import Pic40 from "@/src/assets/images/helper/рисунок 40.svg";
import Pic41 from "@/src/assets/images/helper/рисунок 41.svg";
import Pic42 from "@/src/assets/images/helper/рисунок 42.svg";


const ImageHtml: FC<{src: string, num: number}> = ({src, num}): ReactElement => {
    return (
        <>
            <Image alt="Рисунок 2" src={src} className="mt-10" />
            <div className="text-center text-sm my-10">Рисунок {num}</div>
        </>
    )
}


const HomeDiscrip: FC = (): ReactElement => {
    return (
        <>
            <span className="font-bold">Уважаемые коллеги!</span><br /><br />
            <div className="w-full text-xl indent-[2em]">
                Добро пожаловать в ИСАНД — информационную систему для анализа научной деятельности. Здесь вы сможете посмотреть области компетенции научных сотрудников по их работам с точки зрения теории управления.<br /><br />
                Представители организаций могут зарегистрироваться в системе и загрузить публикации своих сотрудников. Так у них появится возможность узнать, как профили сотрудников вписываются в общую систему. Для этого необходимо написать на адрес isand_reg@ipu.ru — мы оперативно пришлем вам логин и пароль.<br /><br />
                Система работает в тестовом режиме, поэтому в случае обнаружения ошибок или несостыковок убедительная просьба писать по адресу isand_support@ipu.ru.<br /><br />
                За вопросительным знаком в верхнем правом углу каждой страницы скрывается инструкция к разделу, которая позволит вам лучше понять, как пользоваться функционалом ИСАНД. Также помощь вам окажут всплывающие подсказки.<br /><br />
                Желаем вам приятного путешествия по нашей системе!
            </div>
        </>
    )
}

const HomeTech: FC = (): ReactElement => {
    return (
        <>
            <span className="font-bold text-2xl">Раздел «Главная»</span>
            <div className="w-full text-xl indent-[2em]">
                {/* При переходе по ссылке isand.ipu.ru пользователь попадает на главную страницу сайта (рис. 2):<br /> */}
                <ImageHtml src={Pic2} num={2} />
                На данной странице пользователь имеет возможность:
                <ol className="my-2 list-decimal" style={{ listStyleType: 'none', paddingLeft: '0' }}>
                    <li className="my-1 pl-10">1) перейти в один из 6 разделов сайта;</li>
                    <li className="my-1 pl-10">2) войти в личный кабинет, а также ознакомиться с инструкцией к использованию системы.</li>
                </ol>
            </div>
        </>
    )
}

const DeepSearchDiscrip: FC = (): ReactElement => {
    return (
        <div className="w-full text-xl indent-[2em]">
            Данный раздел позволяет отобрать релевантные публикации, ученых, журналы, конференции, организации и города по заранее заданным метафакторам, факторам, подфакторам и терминам теории управления.<br /><br />
            Раздел предполагает первоначальный выбор одного метафактора из четырех. Далее, при переключении на вкладку факторов, выбираются факторы из предложенного списка — имеются возможности поиска факторов, а также их сортировки по алфавиту и по популярности.<br /><br />
            Для уточнения выборки аналогичным образом могут быть заданы подфакторы и термины в соответствующих вкладках.<br /><br />
            Выдача результатов группируется по публикациям, авторам, городам, журналам, организациям и конференциям.<br />
        </div>
    )
}

const DeepSearchTech: FC = (): ReactElement => {
    return (
        <>
            <span className="font-bold text-2xl">Раздел «Тематический поиск»</span>
            <div className="w-full text-xl indent-[2em]">
                Раздел «Тематический поиск» позволяет отобрать релевантные публикации, ученых, журналы, конференции, организации и города по заранее заданным факторам, подфакторам и терминам теории управления.<br /><br />
                При переходе в раздел открывается возможность выбора параметров для поиска (рис. 4).
                <ImageHtml src={Pic4} num={4} />
                Выбирать параметры поиска необходимо в строго заданном порядке: метафакторы, факторы, подфакторы и термины (рис.5).<br/>
                <ImageHtml src={Pic5} num={5} />
                Система может показать результаты поиска на любом из данных этапов — достаточно выбрать интересующие параметры в правильном порядке и нажать на кнопку «Показать результаты» (рис. 6).<br />
                <ImageHtml src={Pic6} num={6} />
                <span className="font-bold">Поэтапная инструкция:</span>
                На начальном этапе предполагается выбор одного <span className="font-bold">метафактора</span> из четырех:
                <ol className="my-2 list-decimal" style={{ listStyleType: 'none', paddingLeft: '0' }}>
                    <li className="my-1 pl-10">1) общенаучная проблематика;</li>
                    <li className="my-1 pl-10">2) предметная область;</li>
                    <li className="my-1 pl-10">3) математический аппарат;</li>
                    <li className="my-1 pl-10">4) сфера применения (рис. 7).</li>
                </ol>
                <ImageHtml src={Pic7} num={7} />
                Далее необходимо перейти на вкладку «<span className="font-bold">Факторы</span>» и выбрать интересующие факторы поиска (рис. 8). <br /> <br />
                Также имеется возможность сортировки факторов по алфавиту и популярности.
                <ImageHtml src={Pic8} num={8} />
                Выбор подфакторов и терминов проводится аналогичным образом. <br /> <br />
                При нажатии на кнопку «Показать результаты» система выдает релевантные данные по публикациям, авторам, городам, журналам, организациям и конференциям (рис. 9).
                <ImageHtml src={Pic9} num={9} />
                При выборе публикации пользователь переходит на ее карточку. Здесь имеется возможность просмотреть аннотацию и авторов, а также ознакомиться с диаграммами по факторам, подфакторам и терминам для данной публикации (рис. 10).
                <ImageHtml src={Pic10} num={10} />
                При переходе во вкладку «Авторы» выводятся наиболее релевантные авторы по выбранным параметрам тематического поиска (рис. 11).
                <ImageHtml src={Pic11} num={11} />
                При выборе автора открывается страница с его профилем. Здесь пользователь также имеет возможность посмотреть диаграммы, связанные с деятельностью данного автора, по факторам, подфакторам и терминам (рис. 12).
                <ImageHtml src={Pic12} num={12} />
            </div>
        </>
    )
}

const ProfilesDiscrip: FC = (): ReactElement => {
    return (
        <div className="text-xl w-full indent-[2em]">
            Данный раздел предоставляет возможность построить и сравнить тематические профили выбранных ученых. Для построения сравнительных диаграмм первым шагом необходимо выбрать авторов для сравнения. При этом имеется возможность выбрать отдельные работы либо все работы автора.<br /> <br />
            Слева на вертикальной оси диаграммы выводятся термины, столбец диаграммы показывает количество вхождений в публикации.<br /> <br />
            Значение столбца диаграммы может быть приведено к одной из пяти схем отображения: абсолютный вектор, стохастический вектор, булев вектор, по количеству использованных терминов, термины.<br /> <br />
            Выбор уровня означает выбор уровня графа глоссария — дерева терминов, в соответствии с которым проводится сравнение публикаций. «Выберите путь» позволяет уточнить тему — второй уровень графа глоссария. Временная шкала позволяет выбрать промежуток времени для сравнения публикаций.<br />
        </div>
    )
}

const ProfilesTech: FC = (): ReactElement => {
    return (
        <>
            <span className="font-bold text-2xl">Раздел «Профили ученых»</span>
            <div className="w-full text-xl indent-[2em]">
                Данный раздел предоставляет возможность построить и сравнить тематические профили выбранных ученых. <br /> <br />
                Слева на вертикальной оси диаграммы выводятся термины, столбец диаграммы показывает количество вхождений в публикации. Значение столбца диаграммы может быть приведено к одной из пяти схем отображения:
                <ul className="my-2 list-disc list-inside" style={{ listStyleType: 'disc', color: 'black' }}>
                    <li className="my-1 pl-4">«Абсолютный вектор» отражает суммарное количество вхождений терминов;</li>
                    <li className="my-1 pl-4">«Стохастический вектор» — абсолютный вектор с нормализованными столбцами;</li>
                    <li className="my-1 pl-4">«Булев вектор» — компоненты этого вектора могут принимать два значения: единица — если количество терминов больше значения «отсечение по терминам» и ноль — в остальных случаях;</li>
                    <li className="my-1 pl-4">«По количеству использованных терминов» — вариант абсолютного вектора, когда «отсечение по терминам» убирает те столбцы, где «уникальных» терминов меньше, чем значение «отсечение по терминам». В случае абсолютного вектора «отсечение по терминам» работает с общим числом вхождений терминов, а в данном случае — с уникальным;</li>
                    <li className="my-1 pl-4">«Термины» — просмотр терминов.</li>
                </ul><br />
                Выбор уровня означает выбор уровня графа глоссария – дерева терминов, в соответствии с которым проводится сравнение публикаций. Большее значение уровня обеспечивает более детальный анализ. Отсе-чение по категориям и по терминам убирает минимальные приведенные значения, чтобы сделать график более выразительным. Чекбокс «Учитывать общенаучные термины» добавляет в выборку слова, относящи-еся к общенаучной проблематике.<br /> <br />
                Временная шкала позволяет выбрать промежуток времени для сравнения публикаций.<br /> <br />
                <span className="font-bold">Поэтапная инструкция</span> <br /> <br />
                Для построения сравнительных диаграмм первым шагом необходимо выбрать авторов для сравнения (рис. 14).
                <ImageHtml src={Pic14} num={14} />
                После нажатия на кнопку пользователю открывается меню выбора авторов и их публикаций в левой части экрана. <br />
                Доступен выбор:
                <ul className="my-2 list-disc list-inside" style={{ listStyleType: 'disc', color: 'black' }}>
                    <li className="my-1 pl-4">одного автора и некоторых его публикаций;</li>
                    <li className="my-1 pl-4"> одного автора и всех его публикаций (пункт «Все работы» третьего выпадающего списка);</li>
                    <li className="my-1 pl-4"> нескольких авторов (автоматический выбор пункта «Все работы» третьего выпадающего списка);</li>
                    <li className="my-1 pl-4">всех авторов и всех публикаций;</li>
                    <li className="my-1 pl-4">всех авторов и/или публикаций, относящихся к выбранным организациям (лабораториям института), научным журналам, конференциям.</li>
                </ul><br />
                <ImageHtml src={Pic15} num={15} />
                При сравнении профилей авторов есть возможность выбора уровня сравнения (рис. 16). Чем левее находится ползунок, тем более обширные научные области будут выводиться по вертикальной оси графика. Чем правее ползунок, тем более узконаправленными будут научные области.<br /> <br />
                Ползунок «Отсечение по категориям», согласно выбранному значению, будет отсекать те научные области, в которых количество входящих терминов меньше некоторого значения.
                <ImageHtml src={Pic16} num={16} />
                При наведении курсора на шкалу появляется информация о числе вхождений терминов, относящихся к деятельности авторов, в данную тематику (рис. 17).
                <ImageHtml src={Pic17} num={17} />
            </div>
        </>
    )
}

const RatingsDiscrip: FC = (): ReactElement => {
    return (
        <div className="text-xl w-full indent-[2em]">
            Данный раздел позволяет получить список релевантных ученых, отсортированный по количеству использованных терминов выбранных факторов или подфакторов.<br /> <br />
            Уровень задает глубину анализа в соответствии с используемым графом глоссария. На нулевом уровне тематической классификации выбираются метафакторы, на первом – факторы, и на втором – подфакторы.
        </div>
    )
}

const RatingsTech: FC = (): ReactElement => {
    return (
        <>
            <span className="font-bold text-2xl">Раздел «Тематическое ранжирование»</span>
            <div className="w-full text-xl indent-[2em]">
                В данном разделе пользователь получает список релевантных ученых, отсортированный по количеству использованных терминов выбранных факторов (1-й уровень тематической классификации) или подфакторов (2-й уровень тематической классификации). Уровень задает глубину анализа в соответствии с используемым графом глоссария. На нулевом уровне тематической классификации выбираются метафакторы, на первом – факторы, и на втором – подфакторы (рис. 19, 20).
                <ImageHtml src={Pic19} num={19} />
                <ImageHtml src={Pic20} num={20} />
                При наведении курсора на одного из авторов показывается информация о количестве вхождений терминов, относящихся к его деятельности, для данной тематики (рис. 21).
                <ImageHtml src={Pic21} num={21} />
            </div>
        </>
    )
}

const GlossaryDiscrip: FC = (): ReactElement => {
    return (
        <></>
    )
}

const GlossaryTech: FC = (): ReactElement => {
    return (
        <>
            <span className="font-bold text-2xl">Раздел «Глоссарий»</span>
            <div className="w-full text-xl indent-[2em]">
                Данный раздел представляет собой сборник терминов теории управления и их описаний (рис. 42).
                <ImageHtml src={Pic42} num={42} />
            </div>
        </>
    )
}

const GraphsDiscrip: FC = (): ReactElement => {
    return (
        <div className="text-xl w-full indent-[2em]">
            Данный раздел позволяет узнать частоту использования терминов в публикациях выбранного автора.<br /><br />
            Запрашиваемая информация отображается в виде графа: его вершина соответствует термину, а ребро — совместному употреблению терминов в одной публикации.<br /><br />
            Построение графов связности терминов производится по автору. Применение бегунка «Отсечение по частоте» позволяет выводить только высокочастотные термины и отсекать низкочастотные. Уровень терминов означает используемый уровень графа глоссария, по которому производится анализ.<br /><br />
            К графу классификатора может быть применено два вида расцветки: по количеству вхождений и по количеству связей. Шкала значений расцветки размещается справа от области графа.<br /><br />
            Отображение ребер и названий добавляет названия и ребра к вершинам терминов. Включение общенаучных терминов добавляет точки общенаучных терминов на граф.
        </div>
    )
}

const GraphsTech: FC = (): ReactElement => {
    return (
        <>
            <span className="font-bold text-2xl">Раздел «Граф классификатора»</span>
            <div className="w-full text-xl indent-[2em]">
                Данный раздел позволяет узнать частоту использования терминов в публикациях выбранного автора. Запрашиваемая информация отображается в виде графа: его вершина соответствует термину, а ребро – совместному употреблению терминов в одной публикации.<br/><br/>
                В выпадающем списке «Выбор автора» (рис. 24) пользователь может выбрать автора, на основе публикационной активности которого строится граф связности терминов.
                <ImageHtml src={Pic23} num={23} />
                Выбирая промежуток на ползунке «Отсечение по частоте» (рис. 24), пользователь устанавливает минимальное и максимальное значение встречаемости термина в статье. Термины, встречаемости которых попадают в промежуток, добавляются на граф.
                <ImageHtml src={Pic24} num={24} />
                Выпадающий список «Уровень факторов» позволяет выбрать группировку понятий, относящихся к деятельности ученого, по метафакторам, факторам, подфакторам и терминам (рис. 25).  Чем меньше уровень, тем из более обширных научных областей будут происходить термины. Чем больше уровень, тем более узконаправленными будут научные области.
                <ImageHtml src={Pic25} num={25} />
                Выбирая промежуток на ползунке «Временная шкала» (рис. 26), пользователь определяет диапазон лет. Только статьи, опубликованные в эти года, учитываются при построении графа. По умолчанию промежуток включает весь период публикационной активности автора.
                <ImageHtml src={Pic26} num={26} />
                Если пользователь хочет, чтобы названия научных терминов отображались постоянно, а не только при наведении на вершину, то необходимо поставить галочку в окошке переключателя «Отображать названия терминов» (рис. 27).
                <ImageHtml src={Pic27} num={27} />
                Если пользователь хочет, чтобы отображались ребра графа, то необходимо поставить галочку в окошке переключателя «Отображать ребра» (рис. 28).
                <ImageHtml src={Pic28} num={28} />
                Если пользователь желает учитывать общенаучные термины при отображении данных, то необходимо поставить галочку в окошке переключателя «Общенаучные термины» (рис. 29).
                <ImageHtml src={Pic29} num={29} />
                Для навигации по графу можно воспользоваться меню справа: увеличить область, отдалить область, увеличить выделенную область (рис. 30).
                <ImageHtml src={Pic30} num={30} />
                Также для увеличения определенной части графа пользователь может выделить ее на самой области отображения графа (рис. 31, 32).
                <ImageHtml src={Pic31} num={31} />
                <ImageHtml src={Pic32} num={32} />
            </div>
        </>
    )
}

const ThesaurusDiscrip: FC = (): ReactElement => {
    return (
        <div className="text-xl w-full indent-[2em]">
            Данный раздел является инструментом отображения используемых терминов теории управления для выбранного ученого. Он предоставляет возможность исследовать окрестность терминов разных порядков. Достигается это за счет построения ориентированного графа взаимосвязи терминов на основании глоссария. При этом вершина графа a соответствует термину a, ориентированное ребро (a, b) – использованию термина a в определении термина b. <br /><br />
            Первым шагом выбирается автор в верхнем поле.<br /><br />
            Поле «Наследовать от» позволяет выбрать термин, через который будут определены другие термины. Глубина проработки наследования задается в соседнем поле с числовой шкалой.<br /><br />
            Если выбрать функцию «Подсветить термин», то будет подсвечен выбранный термин с исходящими стрелками к терминам, которые определены через него, и входящими стрелками от тех терминов, через которые определен выбранный термин.<br /><br />
            Режим «Всегда отображать названия терминов» позволяет видеть названия терминов на графе.
        </div>
    )
}

const ThesaurusTech: FC = (): ReactElement => {
    return (
        <>
            <span className="font-bold text-2xl">Раздел «Граф глоссария»</span>
            <div className="w-full text-xl indent-[2em]">
                Данный раздел является инструментом отображения используемых терминов теории управления для выбранного ученого. Он предоставляет возможность исследовать окрестность терминов разных порядков. Достигается это за счет построения ориентированного графа взаимосвязи терминов на основании глоссария. При этом вершина графа a соответствует термину a, ориентированное ребро (a, b) – использованию термина a в определении термина b.<br/><br/>
                В выпадающем списке «Выбор автора» (рис. 34) пользователь может выбрать автора, на основе публикационной активности которого строится граф.
                <ImageHtml src={Pic34} num={34} />
                Выбирая промежуток на ползунке «Отсечение по частоте» (рис. 35), пользователь устанавливает минимальное и максимальное значение встречаемости термина в статье. Термины, встречаемости которых попадают в промежуток, добавляются на граф.
                <ImageHtml src={Pic35} num={35} />
                Поле «Ключевой термин» (рис. 36) позволяет выбрать термин, через который будут определены другие термины. Глубина проработки наследования задается в соседнем поле с числовой шкалой.
                <ImageHtml src={Pic36} num={36} />
                Если выбрать функцию «Подсветить термин» (рис. 37), то будет подсвечен выбранный термин с исходящими стрелками к терминам, которые определены через него, и входящими стрелками от тех терминов, через которые определен выбранный термин.
                <ImageHtml src={Pic37} num={37} />
                Если пользователь хочет, чтобы названия научных терминов отображались постоянно, а не только при наведении на вершину, то необходимо поставить галочку в окошке переключателя «Отображать названия терминов» (рис. 38).
                <ImageHtml src={Pic38} num={38} />
                Для отображения терминов по интересующей пользователя тематике есть возможность выбора терминов по метафакторам, факторам и подфакторам (рис. 39). После выбора параметров необходимо нажать на кнопку «Перестроить» (рис. 40).
                <ImageHtml src={Pic39} num={39} />
                <ImageHtml src={Pic40} num={40} />
            </div>
        </>
    )
}

export { 
    HomeDiscrip, 
    HomeTech, 
    DeepSearchDiscrip, 
    DeepSearchTech, 
    ProfilesDiscrip, 
    ProfilesTech,
    RatingsDiscrip, 
    RatingsTech,
    GlossaryDiscrip, 
    GlossaryTech,
    GraphsDiscrip, 
    GraphsTech,
    ThesaurusDiscrip,
    ThesaurusTech 
}