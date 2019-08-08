<template>
  <div id="app">
    <h3>Метод априорного ранжирования в легкой промышленности</h3>
    <ul class="wrapper">
      <li class="form-row">
        <label>K - КОЛИЧЕСТВО ФАКТОРОВ</label>
        <input
          :class="{ borderRed: factors==0 || factors==null }"
          type="number" min="1" v-model.number="factors"
          @input.number="changeInputValCount(dataInputArray);hidePdfRes();notNullIn(dataInputArray)"
        >
      </li>
      <li class="form-row">
        <label>M - КОЛИЧЕСТВО ЭКСПЕРТОВ</label>
        <input
          :class="{ borderRed: experts==0 || experts==null }"
          type="number" min="1" v-model.number="experts"
          @input.number="changeInputValCount(dataInputArray);hidePdfRes();notNullIn(dataInputArray)"
        >
      </li>
      <li class="form-row">
        <label>P - УРОВЕНЬ ЗНАЧИМОСТИ ДЛЯ КРИТЕРИЯ ПИРСОНА</label>
        <input
          :class="{ borderRed: significanceLevel==0 || significanceLevel==null }"
          type="number" min="0.01" step="0.01" max="1"
          v-model.number="significanceLevel">
      </li>
      <li class="form-row">
        <label>W - УДОВЛЕТВОРИТЕЛЬНЫЙ УРОВЕНЬ КОЭФФИЦИЕНТА КОНКОРДАЦИИ >=</label>
        <input
          :class="{ borderRed: wellConcordLevel==0 || wellConcordLevel==null }"
          type="number" min="0.01" step="0.01" max="1"
          v-model.number="wellConcordLevel">
      </li>
      <li class="form-row">
        <button @click="writeExample">ПОКАЗАТЬ ПРИМЕР</button>
        <button @click="clearExample">ОЧИСТИТЬ ВСЕ ПОЛЯ</button>
      </li>
      <li class="form-row">
        <button :disabled="!triggerShowBtnMatch" @click="funcMath()">ПРОИЗВЕСТИ РАСЧЕТ</button>
        <button :disabled="!triggerShowBtnPdf" @click="generatePdf()">СКАЧАТЬ PDF ОТЧЕТ</button>
      </li>
    </ul>
    <br>
    <div v-if="experts > 0 & factors > 0 & dataInputArray != null">
      <b>Таблица априорного ранжирования рангов</b>
      <table>
        <tr v-for="m in experts+1">
          <td v-for="k in factors+1">
            <span v-if="k == 1 & m == 1"></span>
            <span v-else-if="k == 1">M{{ m-1 }}</span>
            <span v-else-if="m == 1">K{{ k-1 }}</span>

            <span v-else="">
					    <input type="number" class="dataInput"
                     v-model.number="dataInputArray[m-2][k-2]"
                     :class="{ borderRed: dataInputArray[m-2][k-2]==0 || dataInputArray[m-2][k-2]==null }"
                     @keyup="hidePdfRes();notNullIn(dataInputArray)"
              >
					  </span>
          </td>
        </tr>
      </table>
    </div>
    <div v-if="triggerShowResult" id="hide">
      <h2>Результат расчета</h2>

      Средняя сумма рангов всех экспертов по всем факторам = {{ dataAvgExpFac }}
      <br>
      {{ captionSat.w }}<br>
      {{ captionSat.xt }}
      <br>
      <br>
      <div class="rangir">
        <table>
          <tr>
            <th>
              Место
            </th>
            <th>
              Фактор
            </th>
            <th>
              &#8721; рангов всех экспертов
            </th>
            <th>
              Отклонение &#8721; рангов от средней &#8721; рангов
            </th>
          </tr>

          <tr v-for="(i, index) in dataSortSumExpCutFac">
            <td>
              {{ index+1 }}
            </td>
            <td>
              К{{ dataSortSumExpCutFac[index].id }}
            </td>
            <td>
              {{ dataSortSumExpCutFac[index].val }}
            </td>
            <td>
              {{ dataSortSumExpCutFac[index].res }}
            </td>
          </tr>
        </table>
      </div>
      <br>
      <div class="container">
        <canvas ref="canvas" width="500" height="300"></canvas>
      </div>
    </div>
  </div>
</template>

<script>
    import {Bar, Line} from 'vue-chartjs'

    export default {

        data() {
            return {
                factors: null,
                experts: null,
                dataInputArray: null,
                dataSumExpCutFac: [],
                dataSumExpAllFac: [],
                dataAvgExpFac: null,
                dataCalcAvgRanExp: null,
                dataConcordateRate: null,
                significanceLevel: 0.05,
                wellConcordLevel: 0.6,
                dataXp2: null,
                dataXt2: null,
                dataSortSumExpCutFac: null,
                captionSat: {w: null, ht: null},
                triggerShowBtnPdf: false,
                triggerShowBtnMatch: false,
                triggerShowResult: false,

            }
        },

        methods: {
            notNullIn(arr) {
                for (var i = 0; i < arr.length; i++) {
                    for (var j = 0; j < arr[i].length; j++) {
                        if (arr[i][j] == null || arr[i][j] == 0) {
                            this.triggerShowBtnPdf = false
                            this.triggerShowBtnMatch = false
                            this.triggerShowResult = false
                            return
                        }
                    }
                }
                this.triggerShowBtnMatch = true
            },
            hidePdfRes() {
                this.triggerShowBtnPdf = false
                this.triggerShowResult = false
            },
            //Формирует для заполнения таблицу инпутов ранжирования из факторов и экспертов
            changeInputValCount() {
                if (this.experts > 0 && this.factors > 0) {
                    var temparray = new Array(this.experts);
                    for (var i = 0; i < temparray.length; i++) {
                        temparray[i] = new Array(this.factors);
                    }
                    for (var i = 0; i < this.experts; i++) {
                        for (var j = 0; j < this.factors; j++) {
                            try {
                                if (this.dataInputArray[i][j] === undefined) {
                                    temparray[i][j] = null

                                } else {
                                    temparray[i][j] = this.dataInputArray[i][j]
                                }
                            } catch (err) {
                                temparray[i][j] = null
                            }
                        }
                    }
                    this.dataInputArray = temparray
                }
            },
            //Заполнить тестовыми данными инпуты
            writeExample() {
                this.dataInputArray = [
                    [3, 2, 1, 17, 16, 10, 7, 18, 8, 6, 11, 14, 13, 12, 5, 4, 22, 9, 20, 19, 23, 15, 21],
                    [5, 2, 4, 14, 18, 6, 8, 16, 9, 11, 10, 13, 12, 15, 3, 1, 23, 7, 19, 20, 21, 17, 22],
                    [2, 1, 4, 12, 19, 7, 5, 18, 8, 11, 10, 15, 13, 14, 3, 6, 22, 9, 16, 20, 23, 17, 21],
                    [2, 1, 4, 16, 15, 5, 8, 17, 10, 9, 12, 11, 14, 13, 3, 6, 21, 7, 20, 19, 22, 18, 23],
                    [1, 3, 4, 16, 15, 7, 6, 19, 10, 9, 11, 13, 12, 14, 2, 5, 23, 8, 20, 18, 22, 17, 21]
                ]
                this.factors = 23
                this.experts = 5
                this.triggerShowBtnMatch = true
                this.triggerShowBtnPdf = false
            },
            //Очистить все инпуты
            clearExample() {
                this.factors = 0
                this.experts = 0
                this.dataInputArray = []
                this.dataSumExpCutFac = []
                this.dataSumExpAllFac = []
                this.dataAvgExpFac = null
                this.dataCalcAvgRanExp = null
                this.dataConcordateRate = null
                this.dataXt2 = null
                this.dataXp2 = null
                this.dataSortSumExpCutFac = null
                this.captionSat = {w: null, ht: null}
                this.dataXp2 = null
                this.dataXt2 = null

                this.triggerShowBtnMatch = false
                this.triggerShowBtnPdf = false
                this.triggerShowResult = false
            },

            funcMath() {
                //Расчёт критического значения хи-квадрата распределения, p - уровень значимости, df - число степеней свободы (кол-во факторов)
                function funcInv(p, df) {
                    function gm_log(a) {
                        var b, c, d, e, f, cft;
                        for (cft = [76.18009172947146, -86.50532032941678, 24.01409824083091, -1.231739572450155, .001208650973866179, -5395239384953e-18], c = b = a, d = b + 5.5, d -= (b + .5) * Math.log(d), e = 1.000000000190015, f = 0; 5 >= f; f++) e += cft[f] / ++c;
                        return -d + Math.log(2.5066282746310007 * e / b)
                    }

                    function gm_s(a, b, c) {
                        var g, h, i, j, k, d = 100,
                            e = 3e-7;
                        for (j = a, i = h = 1 / a, g = 1; d >= g; g++)
                            if (++j, i *= b / j, h += i, Math.abs(i) < Math.abs(h) * e) return k = h * Math.exp(-b + a * Math.log(b) - c);
                        return alert("Sorry, failed to find to a solution in gm_s"), -1
                    }

                    function gm_c(a, b, c) {
                        var g, h, i, j, k, l, m, d = 100,
                            e = 3e-7,
                            f = 1e-30;
                        for (h = b + 1 - a, i = 1 / f, j = 1 / h, l = j, m = 1; d >= m && (g = -m * (m - a), h += 2, j = g * j + h, f > Math.abs(j) && (j = f), i = h + g / i, f > Math.abs(i) && (i = f), j = 1 / j, k = j * i, l *= k, !(e > Math.abs(k - 1))); m++) ;
                        return m > d ? (alert("Sorry, failed to find to a solution in gm_c"), -1) : Math.exp(-b + a * Math.log(b) - c) * l
                    }

                    function gm_qb(a, b, c) {
                        var d;
                        if (a + 1 > b) {
                            if (d = gm_s(a, b, c), 0 > d) return -1;
                            d = 1 - d
                        } else d = gm_c(a, b, c);
                        return d
                    }

                    function gm_q(a, b) {
                        var c, d = gm_log(a);
                        return c = gm_qb(a, b, d)
                    }

                    function gm_qderiv(a, b, c) {
                        var d;
                        return d = -b + (a - 1) * Math.log(b) - c, -Math.exp(d)
                    }

                    function gm_qinv(a, b) {
                        var e, f, g, h, i, c = 20,
                            d = 2e-8,
                            j = gm_log(a);
                        for (f = a + Math.sqrt(a) * (.5 - b), e = 1; c >= e; e++) {
                            if (g = gm_qb(a, f, j), 0 > g) return -1;
                            if (g -= b, d > Math.abs(g)) return f;
                            h = gm_qderiv(a, f, j), i = g / h, f -= i
                        }
                        return alert("Sorry, failed to find to a solution in gm_qinv"), -1
                    }

                    function chidist(a, b) {
                        var c;
                        return 0 > a ? (alert("x cannot be negative"), -1) : 0 >= b || Math.floor(b) != b ? (alert("Degrees of freedom must be a positive integer"), -1) : c = gm_q(b / 2, a / 2)
                    }

                    function chi2inv(a, b) {
                        var c;
                        return 0 >= a || a > 1 ? (alert("p must be in the range (0,1]"), -1) : 1e-5 > Math.abs(a - 1) ? 0 : 0 >= b || Math.floor(b) != b ? (alert("Degrees of freedom must be a positive integer"), -1) : (c = gm_qinv(Math.floor(b) / 2, a), 2 * c)
                    }

                    var x;
                    p = Number(p);
                    df = Number(df - 1);
                    x = chi2inv(p, df);
                    if (x < 0) x = NaN;
                    return (x)

                }

                //Сумма рангов всех экспертов по каждому фактору
                function calcSumExpCutFac(factors, experts, dataSumExpCutFac, dataInputArray) {
                    for (var i = 0; i < factors; i++) {
                        var temp = 0;
                        for (var j = 0; j < experts; j++) {
                            temp += dataInputArray[j][i]
                        }
                        dataSumExpCutFac.push({id: i + 1, val: temp})

                    }
                    return (dataSumExpCutFac)

                }

                //Сумма рангов всех экспертов по всем факторам
                function calcSumExpAllFac(factors, dataSumExpCutFac, dataSumExpAllFac) {
                    var temp = null
                    for (var i = 0; i < factors; i++) {
                        temp += dataSumExpCutFac[i].val
                    }
                    dataSumExpAllFac = temp
                    return (dataSumExpAllFac)
                }

                //Средняя сумма рангов всех экспертов по всем факторам
                function calcAvgExpFac(factors, dataAvgExpFac, dataSumExpAllFac) {
                    dataAvgExpFac = Math.round(dataSumExpAllFac / factors)
                    return (dataAvgExpFac)
                }

                //Средний ранг оценки факторов каждым экспертом
                function calcAvgRanExp(factors, dataCalcAvgRanExp) {
                    var temp = null
                    for (var i = 1; i < factors + 1; i++) {
                        temp += i
                    }
                    dataCalcAvgRanExp = temp / factors;
                    return (dataCalcAvgRanExp)
                }

                //Отклонение суммы рангов каждого фактора от средней суммы рангов
                function calcResFacSum(factors, dataSumExpCutFac, dataAvgExpFac) {
                    for (var i = 0; i < factors; i++) {
                        dataSumExpCutFac[i].res = (dataSumExpCutFac[i].val - dataAvgExpFac)

                    }

                    return (dataSumExpCutFac)
                }

                //C помошью коэффициента конкордации Кэнделла W  оценивается степень согласованности мнений экспертов
                function calcConcordateRate(experts, factors, dataXt2, dataXp2, dataConcordateRate, dataSortSumExpCutFac, dataSumExpCutFac) {
                    var temp = null
                    var m = experts
                    var k = factors
                    var w = null

                    for (var i = 0; i < dataSumExpCutFac.length; i++) {
                        temp += dataSumExpCutFac[i].res ** 2
                    }
                    w = ((12 * temp) / ((m ** 2) * ((k ** 3) - k)))

                    dataXt2 = funcInv(0.05, k)
                    dataXp2 = w * (m * (k - 1))
                    dataConcordateRate = w
                    dataSortSumExpCutFac = dataSumExpCutFac.slice();
                    dataSortSumExpCutFac.sort(function (a, b) {
                        return a.val - b.val
                    })
                    return {
                        'dataConcordateRate': dataConcordateRate,
                        'dataSortSumExpCutFac': dataSortSumExpCutFac,
                        'dataXp2': dataXp2,
                        'dataXt2': dataXt2
                    }
                }

                //Генерация текста удовлетворенности расчетов, для template и pdfmake
                function genCaptionSat(dataXp2, dataXt2, dataConcordateRate, wellConcordLevel) {
                    if (dataConcordateRate < wellConcordLevel) {
                        var w = "Коэффициент конкордации недостаточен " + dataConcordateRate.toFixed(2) + " < " + wellConcordLevel + "!"
                    } else {
                        var w = "Коэффициент конкордации достаточен " + dataConcordateRate.toFixed(2) + " => " + wellConcordLevel + "."
                    }
                    if (dataXp2 > dataXt2) {
                        var xt = "Совпадение мнений экспертов признаны неслучайными Xp2 " + dataXp2.toFixed(2) + " > Xt2 " + dataXt2.toFixed(2) + '.'
                    } else {
                        var xt = "Совпадение мнений экспертов признаны случайными Xp2" + dataXp2.toFixed(2) + " < Xt2 " + dataXt2.toFixed(2) + '!'
                    }
                    return ({'w': w, 'xt': xt})
                }

                this.dataSumExpCutFac = []
                this.dataSumExpAllFac = []
                this.dataCalcAvgRanExp = null
                this.dataConcordateRate = null
                this.dataXt2 = null
                this.dataXp2 = null
                this.dataSortSumExpCutFac = null
                this.dataSumExpCutFac = calcSumExpCutFac(this.factors, this.experts, this.dataSumExpCutFac, this.dataInputArray)
                this.dataSumExpAllFac = calcSumExpAllFac(this.factors, this.dataSumExpCutFac, this.dataSumExpAllFac)
                this.dataAvgExpFac = calcAvgExpFac(this.factors, this.dataAvgExpFac, this.dataSumExpAllFac)
                this.dataCalcAvgRanExp = calcAvgRanExp(this.factors, this.dataAvgExpFac, this.dataSumExpAllFac)
                this.dataSumExpCutFac = calcResFacSum(this.factors, this.dataSumExpCutFac, this.dataAvgExpFac)

                var res = calcConcordateRate(this.experts, this.factors, this.dataXt2, this.dataXp2, this.dataConcordateRate, this.dataSortSumExpCutFac, this.dataSumExpCutFac)
                this.dataConcordateRate = res.dataConcordateRate
                this.dataSortSumExpCutFac = res.dataSortSumExpCutFac
                this.dataXt2 = res.dataXt2
                this.dataXp2 = res.dataXp2
                this.captionSat = genCaptionSat(this.dataXp2, this.dataXt2, this.dataConcordateRate, this.wellConcordLevel)
                this.triggerShowResult = true

                setTimeout(this.renderCanvas, 1000);
            },

            generatePdf() {
                this.triggerShowBtnPdf = false
                //Разбитие таблицы ранжирования если она больше чем 23 столбца со значениями (24 всего)
                var resultSliceDataArray = []
                var start = 0
                if (this.factors > 23) {
                    var end = 23
                } else {
                    var end = this.factors
                }
                for (var j = 0; j < (this.factors / 23); j++) {
                    var tempSlice = []
                    for (var i = 0; i < this.experts; i++) {
                        if (i == 0) {
                            tempSlice.push(this.dataInputArray[i].slice(start, end))
                        } else {
                            tempSlice.push(this.dataInputArray[i].slice(start, end))
                        }
                    }
                    start += 23
                    end = start + 23
                    resultSliceDataArray.push(tempSlice)
                }

                //Построение массива с шириной столбцов
                var wPercent = 12
                var tWidths = [wPercent]
                for (var i = 0; i < this.factors; i++) {
                    tWidths.push(wPercent)
                }

                //Заполнение массива от 1 до max length
                function indexOfDataArray(arr) {
                    var returnArr = []
                    for (var i = 0; i < arr.length; i++) {
                        returnArr.push(i)
                    }
                    return (returnArr)
                }

                //Таблица Ранжирование построение тела
                var kIndex = 0

                function buildTableRangBody(data, columns) {
                    var body = [];
                    var columns0hide = ['']
                    for (var i = 1; i <= columns.length; i++) {
                        kIndex += 1
                        columns0hide.push({text: 'K' + kIndex, style: "thStyle"})
                    }

                    body.push(columns0hide);
                    var i = 0;
                    data.forEach(function (row) {
                        var dataRow = [];
                        i += 1
                        dataRow.push({text: 'M' + i, style: "thStyle"})
                        columns.forEach(function (column) {
                            dataRow.push({text: row[column], style: "tdStyle"});
                        })
                        body.push(dataRow);
                    });
                    return body;
                }

                //Таблица Ранжирование построение таблицы
                function tableRang(data, columns) {
                    return {
                        table: {
                            headerRows: 1,
                            widths: tWidths,
                            padding: 0,
                            body: buildTableRangBody(data, columns)
                        },
                    };
                }

                //Таблица Рейтинг построение тела
                function buildTableRatingBody(data, columns) {
                    var body = [];
                    var columns0hide = []
                    columns0hide.push({text: 'Место', style: "thStyle"})
                    columns0hide.push({text: 'Фактор', style: "thStyle"})
                    columns0hide.push({text: '∑ рангов всех экспертов', style: "thStyle"})
                    columns0hide.push({text: 'Отклонение ∑ рангов от средней ∑ рангов', style: "thStyle"})
                    body.push(columns0hide);
                    var i = 0;
                    data.forEach(function (row) {
                        var dataRow = [];
                        i += 1
                        dataRow.push({text: i, style: "tdStyle"});
                        dataRow.push({text: 'К' + row.id, style: "tdStyle"});
                        dataRow.push({text: row.val, style: "tdStyle"});
                        dataRow.push({text: row.res, style: "tdStyle"});
                        body.push(dataRow);

                    });
                    return body;
                }

                //Таблица Рейтинг построение таблицы
                function tableRating(data, columns) {
                    return {
                        table: {
                            headerRows: 1,
                            widths: ['auto', 'auto', 'auto', 'auto'],
                            padding: 0,
                            body: buildTableRatingBody(data, columns)
                        },
                    };
                }

                //Создание непостредственно pdf файла
                var dd = {
                    styles: {
                        header:
                            {
                                bold: true,
                                margin: [0, 10, 0, 10],
                                alignment: 'center',
                                width: '50px',
                            },
                        tdStyle: {
                            fontSize: 9,
                            margin: -2,
                        },
                        thStyle: {
                            fontSize: 9,
                            margin: -2,
                            bold: true
                        }
                    },
                    content: [
                        {
                            fontSize: 14,
                            text: 'Метод априорного ранжирования в легкой промышленности', style: 'header'
                        },
                        {
                            fontSize: 12,
                            text: 'Таблица априорного ранжирования рангов:'
                        },
                    ]
                }
                //Заполнение таблицей ранжирования разбитой по 23 столбца
                for (var i = 0; i < resultSliceDataArray.length; i++) {
                    dd.content.push(tableRang(resultSliceDataArray[i], indexOfDataArray(resultSliceDataArray[i][0])))
                    dd.content.push(' ')
                }

                dd.content.push({text: this.captionSat.w, fontSize: 10})
                dd.content.push({text: this.captionSat.xt, fontSize: 10})
                dd.content.push(' ')
                dd.content.push(tableRating(this.dataSortSumExpCutFac, indexOfDataArray(this.dataSortSumExpCutFac)))
                //Парсим img charjs графика

                var parseChartImg = document.getElementsByClassName('chartjs-render-monitor')[0].toDataURL('image/png')
                var pdfChartImg = {
                    image: parseChartImg,
                    width: 500,
                    height: 300,
                }

                dd.content.push(pdfChartImg)
                this.$pdfmake.createPdf(dd).download('rangir.pdf');
            },
            // Отрисовка графика с !!!Велосипедом!!! Добавлены лишнее первое и последнее значение в массив values, а также в labels. Для того, чтобы line отрисовывалась без прерываний от начала координат до конца.
            renderCanvas() {
                if (this.dataSortSumExpCutFac !== null && this.factors > 0 && this.dataAvgExpFac != null) {
                    var bgColor = ['#39E639']
                    var labels = ['hide']
                    var values = [0]
                    var avg = [this.dataAvgExpFac, this.dataAvgExpFac]

                    for (var i = 0; i < this.factors; i++) {
                        labels.push("K" + (this.dataSortSumExpCutFac[i].id + 1))
                        values.push(this.dataSortSumExpCutFac[i].val)
                        avg.push(this.dataAvgExpFac)
                        if (this.dataSortSumExpCutFac[i].val < this.dataAvgExpFac) {
                            bgColor.push('#39E639')
                        } else {
                            bgColor.push('#FF9640')
                        }
                    }

                    var startLabel = labels[1]
                    var endLabel = labels[labels.length - 1]
                    values.push(0)
                    labels.push('hide')
                    bgColor.push('#FF9640')
                    this.renderChart({
                        datasets:
                            [
                                {
                                    type: 'line',
                                    label: 'Среднее значение ' + this.dataAvgExpFac,
                                    fill: false,
                                    pointRadius: 0,
                                    borderColor: 'red',
                                    borderWidth: '5',
                                    pointHoverRadius: 0,
                                    backgroundColor: 'red',
                                    data: avg,

                                },
                                {
                                    type: 'bar',
                                    label: 'Наиболее действенные факторы',
                                    backgroundColor: bgColor,
                                    data: values,
                                    label: 'Наиболее действенные факторы',
                                },
                                //Внимание !!!КОСТЫЛЬ!!! для добавление заголовка в bar, но массив данных отсутствует
                                {
                                    type: 'line',
                                    label: 'Наименее действенные факторы',
                                    backgroundColor: '#FF9640',
                                },
                            ],
                        labels: labels,
                    }, {
                        animation: false,
                        scales: {
                            yAxes: [{
                                ticks: {
                                    beginAtZero: true,
                                },
                            }],
                            xAxes: [{
                                ticks: {
                                    min: startLabel,
                                    max: endLabel
                                },
                            }],
                        },
                    })

                }
                this.triggerShowBtnPdf = true

            }
        },

        extends:
        Bar,

    }
</script>

