import a from './a.js'
import axios from 'axios'

axios
    .get('./static/a.v')
    .then(res => {
        console.log(res.data)
        const div = document.createElement('div')
        div.innerHTML = res.data
        // document.body.appendChild(div)
        return div
    })
    .then(a => {
        console.log(a.querySelectorAll('style')[0].innerHTML)
        const style = document.createElement('style')
        style.innerHTML = a.querySelectorAll('style')[0].innerHTML
        const div = document.createElement('div')
        div.innerHTML = a.querySelector('aaaccc').innerHTML
        const js = document.createElement('script')
        js.innerHTML = a.querySelector('script').innerHTML
        console.log(div.innerHTML)
        document.body.appendChild(style)
        document.body.appendChild(div)
        document.body.appendChild(js)
        // console.log(_)
    })
axios.get('./static/b.txt').then(res => {
    console.log(res.data)
})
axios.get('./static/c.png').then(res => {
    console.log(res.data)
})
function component() {
    const element = document.createElement('div')
    element.innerHTML = a
    console.log(a)
    return element
}
document.body.appendChild(component())
