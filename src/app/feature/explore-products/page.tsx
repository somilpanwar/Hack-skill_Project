"use client"
import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import Image from 'next/image'
import React from 'react'

const Product = () => {
  return (
    <>
      <Navbar />
      <main>
        <div className='  flex flex-col gap-5 items-center justify-center p-5 '>
          <h1 className='text-6xl font-bold text-blue-800'>Explore-Products</h1>
          <input type="text" className='bg-gray-100 p-3 text-gray-500 rounded-xl placeholder:text-gray-500 w-1/2 pl-5' placeholder='Search...' />
        </div>

        <div className='flex gap-3 '>
          <div className='w-1/4 p-4 flex flex-col gap-2 justify-start bg-blue-500'>
            <button>Click Me</button>
            <button>Click Me</button>
            <button>Click Me</button>
            <button>Click Me</button>
            <button>Click Me</button>

          </div>

          <div className='bg-gray-100 grid grid-cols-3 gap-2  w-full p-4'>
            <section className='p-3 rounded-lg bg-gray-500 w-fit'>
              <Image
                src={'/images/demo.jpeg'}
                height={50}
                width={60}
                alt='demo'
              />
              <h2>Bags LV</h2>
              <h3>Price : $400</h3>

            </section>

            <section className='p-3 rounded-lg bg-gray-500 w-fit'>
              <Image
                src={'/images/demo.jpeg'}
                height={50}
                width={60}
                alt='demo'
              />
              <h2>Bags LV</h2>
              <h3>Price : $400</h3>

            </section>


            <section className='p-3 rounded-lg bg-gray-500 w-fit'>
              <Image
                src={'/images/demo.jpeg'}
                height={50}
                width={60}
                alt='demo'
              />
              <h2>Bags LV</h2>
              <h3>Price : $400</h3>

            </section>



            <section className='p-3 rounded-lg bg-gray-500 w-fit'>
              <Image
                src={'/images/demo.jpeg'}
                height={50}
                width={60}
                alt='demo'
              />
              <h2>Bags LV</h2>
              <h3>Price : $400</h3>

            </section>


            <section className='p-3 rounded-lg bg-gray-500 w-fit'>
              <Image
                src={'/images/demo.jpeg'}
                height={50}
                width={60}
                alt='demo'
              />
              <h2>Bags LV</h2>
              <h3>Price : $400</h3>

            </section>



            <section className='p-3 rounded-lg bg-gray-500 w-fit'>
              <Image
                src={'/images/demo.jpeg'}
                height={50}
                width={60}
                alt='demo'
              />
              <h2>Bags LV</h2>
              <h3>Price : $400</h3>

            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

export default Product