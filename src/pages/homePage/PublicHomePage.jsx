import { Link } from "react-router-dom";


function PublicHomePage(){

    return (
        <div>
            
            <main>
                <section>
                    <h1>Smart Pocket Money family</h1>
                    <p>best app in the world to earn money</p>
                    <Link to='/register'>Get started</Link>
                </section>
                <section>
                    <article>
                        <img src="/../" alt="Chores icon" />
                        <h2>Create & Assign new Chores & Allowances</h2>
                    </article>
                    <article>
                        <img src="/../" alt="Chores icon" />
                        <h2>You can change a chore price and WhatsApp your kids about it</h2>
                    </article>
                    <article>
                        <img src="/../" alt="Chores icon" />
                        <h2>WhatsApp your parents when the chore is done</h2>
                    </article>
                </section>
            </main>
        </div>
    )
}

export default PublicHomePage;