class Person(
    val name: String,
    val dateOfBirth: String,
    val gender: String,
    val age: Int,
    val job: String
)

class Mama(
    val name: String,
    val dateOfBirth: String,
    val age: Int
)

class Dad(
    val name: String,
    val dateOfBirth: String,
    val age: Int
)

fun main() {

    val person = Person(
        name = "Serik",
        dateOfBirth = "2004-02-29",
        gender = "Male",
        age = 20,
        job = "Software Engineer"
    )

    val mama = Mama(
        name = "Makhabat",
        dateOfBirth = "1965-09-18",
        age = 59
    )

    val dad = Dad(
        name = "Ermek",
        dateOfBirth = "1962-11-22",
        age = 61
    )

    println("""
        Person Information:
        Name: ${person.name}
        Date of Birth: ${person.dateOfBirth}
        Gender: ${person.gender}
        Age: ${person.age}
        Job: ${person.job}

        Mama Information:
        Name: ${mama.name}
        Date of Birth: ${mama.dateOfBirth}
        Age: ${mama.age}

        Dad Information:
        Name: ${dad.name}
        Date of Birth: ${dad.dateOfBirth}
        Age: ${dad.age}
    """)
}
