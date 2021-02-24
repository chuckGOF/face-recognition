import React, { Component } from 'react'
import Navigation from './components/Navigation/Navigation'
import Logo from './components/Logo/Logo'
import ImageForm from './components/ImageForm/ImageForm'
import FaceRecognition from './components/FaceRecognition/FaceRecognition'
import SignIn from './components/SignIn/SignIn'
import Register from './components/Register/Register'
import Rank from './components/Rank/Rank'
import './App.css'
import Particles from 'react-particles-js'

const particlesOptions = {
	particles: {
		number: {
			value: 80,
			density: {
				enable: true,
				value_area: 800
			}
		}
	}
}

const initialState = {
	input: '',
	imageUrl: '',
	boxes: [],
	route: 'signin',
	isSignedIn: false,
	user: {
		id: '',
		name: '',
		email: '',
		entries: '',
		joined: ''
	}
}

class App extends Component {
	constructor() {
		super()
		this.state = initialState
	}

	loadUser = (user) => {
		this.setState({
			user: {
				id: user.id,
				name: user.name,
				email: user.email,
				entries: user.entries,
				joined: user.joined
			}
		})
	}

	calculateFaceLocations = (data) => {
		// const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box
		const clarifaiFaces = data.outputs[0].data.regions.map(face => {
			let clarifaiFace = face.region_info.bounding_box
			const image = document.getElementById('imagewidth')
			const width = Number(image.width)
			const height = Number(image.height)

			return {
				leftCol: clarifaiFace.left_col * width,
				topRow: clarifaiFace.top_row * height,
				rightCol: width - (clarifaiFace.right_col * width),
				bottowRow: height - (clarifaiFace.bottom_row * height)
			}
		})
		return clarifaiFaces
	}

	faceBoxes = (boxes) => {
		this.setState({boxes: boxes})
	}

	onInputChange = (event) => {
		// console.log(event.target.value)
		this.setState({input: event.target.value})
	}

	onButtonSubmit = () => {
		// d02b4508df58432fbb84e800597b8959
		// console.log(this.state.user)
		this.setState({ imageUrl: this.state.input })
		fetch('https://frozen-escarpment-39125.herokuapp.com/imageurl', {
			method: 'post',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				input: this.state.input
			})
			}).then(response => response.json())
			.then((response) => {
				if (response) {
					fetch('https://frozen-escarpment-39125.herokuapp.com/image', {
						method: 'put',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({
							id: this.state.user.id
						})
					})
						.then(response => response.json())
						.then(count => {
							this.setState(Object.assign(this.state.user, {entries: count}))
						}).catch(err => console.log(err))
				}
				this.faceBoxes(this.calculateFaceLocations(response))
			})
			.catch(err => console.log(err))
		// this.setState({input: ''})
	}

	onRouteChange = (route) => {
		if (route === 'home') {
			this.setState({isSignedIn: true})
		} else if (route === 'signin') {
			this.setState(initialState)
		}
		this.setState({route: route})
	}

	render() {
		const {isSignedIn, imageUrl, boxes, route} = this.state
		return (
			<div className="App">
				<Particles className='particles' params={ particlesOptions }/>
				<Navigation onRouteChange={this.onRouteChange} isSignedIn={isSignedIn}/>
				{route === 'home'
					? <div> 		
							<Logo />
							<Rank name={this.state.user.name} entries={this.state.user.entries} />
							<ImageForm onInputChange={this.onInputChange} onButtonSubmit={this.onButtonSubmit}/>
							<FaceRecognition imageUrl={imageUrl} boxes={boxes} />
						</div>
					: (
						route === 'signin' 
							? <SignIn loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
							: <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
					)
				}
			</div>
		)
	}
}

export default App;