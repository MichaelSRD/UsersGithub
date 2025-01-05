'use client'
import Image from "next/image";
import React, { useCallback, useEffect, useState } from "react";
import { debounce } from 'lodash';
import { formatDistanceToNow } from 'date-fns';

interface GitHubUser {
  followers: string;
  following: string;
  location: string;
  repos_url: string;
  avatar_url: string;
  login: string;
  bio:string;
}
interface reposUser {
  name:string;
  description:string;
  stargazers_count: number;
  forks_count: number;
  updated_at:string;
  html_url:string;
  license: {
    spdx_id: string
  } | null;
}

export default function Home() {
   const [ username, setUsername ] = useState('');
   const [ espera, setEspera ] = useState<GitHubUser | null>(null);
   const [ user, setUser ] = useState<GitHubUser | null>(null);
   const [ repos, setRepos ] = useState<reposUser[]>([]);
   const [mostrarMas, setMostrarMas] = useState(false);
   const elementosPorPagina = 4;
  

   const fetchUser = useCallback(async (searchUsername: string) => {
    if (!searchUsername) {
      setEspera(null)
      return
    }
    
    try {
      const response = await fetch(`https://api.github.com/users/${searchUsername}`)
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Usuario no encontrado')
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setEspera(data);
    } catch (err) {
      setEspera(null)
      setRepos([])
    } finally {
      
    }
  }, [])
 
  const reposdata = async (user: GitHubUser) => {
    try {
      const reposResponse = await fetch(user.repos_url)
      if (!reposResponse.ok) {
        throw new Error(`HTTP error! status: ${reposResponse.status}`)
      }
      const reposData: reposUser[] = await reposResponse.json()
      setRepos(reposData)
    } catch (error) {
      console.error("Error fetching repos:", error)
      setRepos([])
    }
  }
  const debouncedFetchUser = useCallback(
    debounce((username: string) => fetchUser(username), 300),
    [fetchUser]
  )

  useEffect(() => {
    const fetchDefaultUser = async () => {
      try {
        const response = await fetch('https://api.github.com/users/github')
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        setUser(data)
        await reposdata(data)
      } catch (error) {
        console.error("Error fetching default user:", error)
      }
    }

    fetchDefaultUser()
  }, [])

  useEffect(()=>{
    debouncedFetchUser(username)

    return ()=>{
      debouncedFetchUser.cancel()
    }
  }, [ username, debouncedFetchUser ])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     setUsername(e.target.value)
  }
  const handleclick = ()=>{
    if(espera){
      reposdata(espera)
    setUser(espera);
    setEspera(null)
    }
  }

  const formatUpdateAt = (dateString: string)=>{
   const date = new Date(dateString)
   return formatDistanceToNow(date, { addSuffix: true })
  }
  const datosVisibles = mostrarMas ? repos : repos.slice(0, elementosPorPagina);

  return (
   <main className=" w-full m-auto justify-center flex  pt-4 px-12 flex-col   " >
    <section className=" absolute -z-1 w-full min-h-[234px]  top-0 left-0 ">
        <Image src={"/hero-image-github-profile.png"} alt={""} fill className=" object-cover z-[-1] "  />
    </section>
    <section className=" relative" >
      <div className=" relative ">
      <picture className=" absolute top-[50%] left-3  -translate-y-1/2  " >
      <img src="/Search.svg" alt="icono de busqueda" />
      </picture>
      <input type="text" onChange={handleInputChange} value={username} placeholder="username" className=" w-full bg-[#20293A] rounded-xl p-4 pl-12 te-[#4A5567]  " />
      </div>
      {espera && (
        <div className=" cursor-pointer w-full bg-[#111729] flex  absolute mt-2 rounded-xl p-2" onClick={handleclick} >
          <picture>
            <Image src={espera.avatar_url} alt="avatar de user" width={60} height={60} className=" rounded-lg mr-3 " />
          </picture>
          <div>
            <p className=" font-bold text-lg " >{espera.login}</p>
            <p>{espera.bio}</p>
          </div>
        </div>
      )}
    </section>

    {user && (
        <>
         <section className=" mt-32 flex  ">
      <picture className=" border-[6px] border-[#20293A] bg-[#20293A] w-[100px] h-[100px]  flex rounded-xl ">
        <Image src={user.avatar_url} alt={""} width={100} height={100} className=" rounded-xl "   />
      </picture>
      <section className=" space-y-3 mt-14 ml-8 md:flex md:items-baseline md:space-x-4 md:mt-10 ">
        <div className="  p-4  rounded-xl bg-[#111729]  flex max-w-max ">
          <p className="text-[#4A5567]" >Followers</p>
          <span className=" text-[#CDD5E0] pl-4 ml-4 border-l border-white ">{ user.followers }</span>
        </div>
        <div className=" p-4   rounded-xl bg-[#111729] flex max-w-max ">
          <p className="text-[#4A5567]" >Following</p>
          <span className=" text-[#CDD5E0] pl-4 ml-4 border-l border-white ">{user.following}</span>
        </div>
        <div className=" p-4   rounded-xl bg-[#111729] flex max-w-max ">
          <p className="text-[#4A5567]" >Location</p>
          <span className=" text-[#CDD5E0] pl-4 ml-4 border-l border-white ">{user.location}</span>
        </div>
      </section>
    </section>
    <section>
      <h2 className=" font-semibold text-3xl text-[#CDD5E0] mt-6 "  >{user.login}</h2>
      <p className=" text-[#CDD5E0]  mb-8 mt-2 ">{user.bio}</p>
      <div className=" md:grid md:grid-cols-2 md:gap-4  ">
      {datosVisibles.map((repo)=>(
          <a key={repo.name} href={repo.html_url}  target="_blank" rel="noopener noreferrer" className=" block  rounded-xl p-4 bg-gradient-to-r from-[#111729] to-[#1D1B48] space-y-3 md:mt-0  mt-6 transform transition duration-300 ease-in-out hover:scale-[103%] ">
          <h4>{repo.name}</h4>
          <p>{repo.description}</p>
          <div className=" flex space-x-4">
            { repo.license && (
               <>
               <div className="flex space-x-2  " >
            <Image src={"/Chield_alt.svg"} alt={""} width={20} height={20}/>
             <p>{repo.license.spdx_id}</p>
            </div>
            <div className="flex  space-x-2 " >
              <Image src={"/Nesting.svg"} alt={""} width={20} height={20}/>
               <p>{repo.forks_count}</p>
            </div>
            <div className="flex space-x-2  " >
              <Image src={"/Star.svg"} alt={""} width={20} height={20}  />
              <p>{repo.stargazers_count}</p>
            </div>
            <span>{formatUpdateAt(repo.updated_at)} </span>
               </>
            ) }
          </div>
        </a>
      ))}
      </div>
      { repos.length > elementosPorPagina &&(
        <button onClick={ () => setMostrarMas(!mostrarMas ) } className=" flex justify-self-center my-8 text-[26px] "  >
         { mostrarMas ? 'View less' : " View all repositories" }
        </button>
      ) }
    </section>
        </>
    )}
   
   </main>
  );
}
