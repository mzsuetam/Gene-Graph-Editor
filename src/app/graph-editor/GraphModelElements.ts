import { GraphEditorComponent, NODE_TAG, EDGE_1_TAG, EDGE_2_TAG, EdgeType } from './graph-editor.component'


export class Graph{
	nodes : Node[];
	edges_1 : Edge[];
	edges_2 : Edge[];
  
	constructor(){
	  this.nodes = []
	  this.edges_1 = []
	  this.edges_2 = []
	}
  }
  
  export class Node{
	id : number;
	badge : Badge;
  
	edges_1_out : number[] = [];
	edges_1_in : number[] = [];
	edges_2_out : number[] = [];
	edges_2_in : number[] = [];
  
	physical: PhysicalNodeProperties = {} as PhysicalNodeProperties;
  
	constructor(n: number, d: number, x: number, y: number, badge ?: Badge){
	  this.id =  n    
	  this.physical = {
		x: x,
		y: y,
		height: d,
		width: d
	  }
	  if ( badge ){
		this.badge = badge
	  }
	  else{
		let b = {
		  text: NODE_TAG,
		  sub: n.toString(),
		  sup: ""
		} as Badge
		this.badge = b
	  }
	}
  }
  
  export interface PhysicalNodeProperties {
	x : number;
	y : number;
	height : number;
	width : number;
  }
  
  export class Edge{
	id : number;
	type : EdgeType;
	badge : Badge;
  
	start_node: number;
	end_node: number;
  
	physical : PhysicalEdgeProperties = {} as PhysicalEdgeProperties
  
	constructor(n: number, parent : GraphEditorComponent, start:number, end:number, type: EdgeType, badge?: Badge){
	  this.id =  n   
	  this.start_node = start 
	  this.end_node = end 
	  this.type = type
  
	  let x0 = parent.getNodeById(start).physical.x
	  let y0 = parent.getNodeById(start).physical.y
  
	  let dx = parent.getNodeById(start).physical.x - parent.getNodeById(end).physical.x
	  let dy = parent.getNodeById(start).physical.y - parent.getNodeById(end).physical.y
	  
	  this.physical.width = -dx
	  this.physical.height = -dy

	  this.physical = {
		x: x0,
		y: y0,
		height: -dy,
		width: -dx,
		v1_x: 0,
		v1_y: 0,
		v2_x: 0,
		v2_y: 0,
	  }
  
	  this.setVSimple(50)
  
	  if ( badge ){
		this.badge = badge
	  }
	  else if ( type == EdgeType.E ){
		let b = {
		  text: EDGE_1_TAG,
		  sub: n.toString(),
		  sup: ""
		} as Badge
		this.badge = b
	  }
	  else { //} if ( type == EdgeType.F ){
		let b = {
		  text: EDGE_2_TAG,
		  sub: n.toString(),
		  sup: ""
		} as Badge
		this.badge = b
	  }
	}
  
	private setVSimple(dh: number){
	  // let x1 = this.physical.x
	  // let x2 = this.physical.x+this.physical.width
	  // let y1 = this.physical.y
	  // let y2 = this.physical.y+this.physical.height
  
	  // if ( x1 == x2 ){
	  //   let xc = x1
	  //   let yc = (y1+y2)/2
  
	  //   let xs = x1+dh
	  //   let ys = yc
  
	  //   this.physical.v1_x = this.physical.v2_x = xs
	  //   this.physical.v1_y = this.physical.v2_y = ys
	  // }
  
	  // console.log( x1 + ' ' + y2 + ' | ' + x2 + ' ' + y2 + ' | ' + this.physical.v1_x  + ' ' + this.physical.v1_y  )
	}
	
  }
  
  export interface PhysicalEdgeProperties{
	x : number;
	y : number;
	height : number;
	width : number;
	v1_x : number;
	v1_y : number;
	v2_x : number;
	v2_y : number;
  }
  
  export interface Badge{
	text: string;
	sub: string;
	sup: string;
  }
  