import {
  expect,
  assert,
} from 'chai'

import Store from '../../babel/store'


describe('Initialization', () => {
  it('without new', () => {
    try { Store() } catch (e) {}
    assert.throws( 
      ()=> Store({}),
      TypeError
    )
  })

  it('with new', () => {
    expect(new Store({}) instanceof Store).to.be.true
  })



})


describe("Successful construction", () => {

    let startDidRun = false;

    const store = new Store({
      start(){
        startDidRun = true;
      },
      modules:{
        myModule:{}
      }
    })

  it('when start function exists', () => {

    expect(startDidRun).to.be.true

  })

  it('when modules exist', () => {

    expect(store.module('myModule') instanceof Store).to.be.true

  })

})

describe("Opener Methods", function(){

  const component = {

  }

  const state = {
    random:Math.random(),
    date:Date.now(),
    count:0,
  }
  const setters = {
    increment(state){
      state.count++;
    }
  }
  const computed = {
    datePlusCount(state){
      return state.date + state.count
    }
  }
  const actions = {
    updateDate({
      state,
      done,
    }){

      return new Promise((resolve, reject)=>{
        try{

          // let i = setInterval(()=>{
            state.date = Date.now();
            done()
            resolve()
          // }, 0)

        }catch(error){
          reject(error)
        }
      })
      
    }
  }
  const store = new Store({
    state,
    setters,
    computed,
    actions,
  })




  let main_component = {
    forceUpdate(){
      main_component.componentWillUpdate();
    }
  }

  main_component.state = {
    ...store.openState(['count', 'date', 'random'], main_component)
  }

  main_component.componentDidMount()





  describe("#openState()", ()=>{

    it('object notation 🤝 array notation', ()=>{
      assert.equal(
        store.openState(['random'], component).random,
        store.openState({ random:'random' }, component).random
      )
    })

    it('does return state', ()=>{

      assert.equal(
        store.openState(['random'], component).random,
        state.random
      )
      
    })

    it('injects computed values', ()=>{
      let computed_component = {}
      let result = store.openState(['datePlusCount'], component).datePlusCount;
      
      assert.equal(
        result,
        (state.date + state.count)
      )

    })

  })

  describe("#openSetters()", ()=>{

    let object_component = {}
    let array_component = {}


    store.openSetters(['increment'], main_component)

    it('object notation 🤝 array notation', ()=>{

      store.openSetters(['increment'], array_component)
      store.openSetters({'increment':'increment'}, object_component)

      assert.property(object_component, 'increment')
      assert.property(array_component, 'increment')
      
    })


      let initialCount = state.count;
      let component_initialCount = main_component.state.count;

      main_component.increment();

      let nextCount = state.count;
      let component_nextCount = main_component.state.count;

      describe('Setter Updates', ()=>{

        it(`does update store's state`, ()=>{

          assert.isAbove(nextCount, initialCount)

        })

        it(`does update component's state`, ()=>{
          assert.isAbove(component_nextCount, component_initialCount)
        })

      })


  })

  describe("#openActions()", ()=>{

    let object_component = {}
    let array_component = {}


    it('object notation 🤝 array notation', ()=>{
      const action = 'updateDate'
      store.openActions([action], array_component)
      store.openActions({ [action] : action }, object_component)

      assert.property(object_component, action)
      assert.property(array_component, action)
      
    })

    store.openActions(['updateDate'], main_component)

    let initialDate = state.date;
    let component_initialDate = main_component.state.date;

    describe('Action Updates', function(root_done){

      this.timeout(5000)

      main_component.updateDate()
      .then(()=>{

        let nextCount = state.date;
        let component_nextCount = main_component.state.date
        

          it(`does update store's state`, ()=>{

            assert.isAbove(nextCount, initialDate)

          })

          it(`does update component's state`, ()=>{
            assert.isAbove(component_nextCount, component_initialDate)
          })
          
        
          root_done()

          //end describe
        })
        
        //end promise
      })


      //end #openActions describe
  })

  //end openers describe
})


