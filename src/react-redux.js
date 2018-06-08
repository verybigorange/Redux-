import React, { Component } from 'react'
import PropTypes from 'prop-types'

export class Provider extends Component {
    //把store放在context上，让子组件可以访问
    getChildContext(){
        return {
            store:this.props.store
        }
    }

    render() {
        return this.props.children
    }
}

Provider.childContextTypes = {
    store:PropTypes.object
}

export function connect(mapStateToProps,mapStateToDispatch) { 
    return function(WrapperComponent){
        class Connect extends Component {
            constructor(props,context){
                super(props)
              
                //通过context上的store的getState()方法获取到状态树，然后传入到mapStateToProps中取得需要的属性
                //然后再传到WrapperComponent中去

                // 将组件自己的属性、状态树上需要的属性，以及更新reducer的方法合并传入到该组件中。
                this.store = props.store || context.store;
                
                this.state = {
                    nextProps:this.merge()
                }

                context.store.subscribe(()=>{
                    this.setState({
                        nextProps:this.merge()
                    })
                })
              
            }
            // 浅比较
            hasChanged(old,next){
                if(old === next) return false

                if(Object.keys(old).length !== Object.keys(next).length) return true
                
                // 属性名以及属性值是否相同
                for(let key in old){
                    if(!next.hasOwnProperty(key)) return true
                    if(old[key] !== next[key]) return true
                }
                return false
            }

            shouldComponentUpdate(nextProps,nextState){
                return this.hasChanged(this.state.nextProps,nextState)
            }

            merge(){
                return {
                    ...this.props,
                    ...mapStateToProps(this.store.getState(),this.props),
                    ...mapStateToDispatch(this.store.dispatch)
                }
            }

            render(){
                return  (
                    <WrapperComponent {...this.state.nextProps}></WrapperComponent>
                )
            }
        }

        Connect.contextTypes = {
            store:PropTypes.object
        }

        return Connect
    }
} 

