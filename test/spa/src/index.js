import React from 'react'
import ReactDOM from 'react-dom'
import './index.scss'
import Home from './home'

let yoname = 'name'

yoname = 'yoyoyo'

let cname = true ? 'name' : 'yoyoyo'

let newName = 'yoyoyo'

const App = () => (
	<section>
		<div id="root" className="name jh">
			<h1 className={`name ${true ? newName : 'name'} jjj`}>hello world {cname}</h1>
			<div className="bg1"></div>
			<div className="bg2 name">321123</div>
			<Ims className={true ? cname : ( true ? yoname : cname)} />	
		</div>
	</section>	
)

class Ims extends React.Component { 
	render() { 
		return (
			<Home />
		)
	}
}

ReactDOM.render(
	<App />	
	,document.getElementById("root")
)
